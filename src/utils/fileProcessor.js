import * as XLSX from 'xlsx'

export function processFiles(loadReport, salesReport) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const loadData = await parseFile(loadReport, e.target.result)
        const salesReader = new FileReader()
        salesReader.onload = async (e2) => {
          try {
            const salesData = await parseFile(salesReport, e2.target.result)
            
            // Debug available columns
            console.log('Load Report columns:', Object.keys(loadData[0]))
            
            const matches = matchData(loadData, salesData)
            resolve(matches)
          } catch (err) {
            reject(err)
          }
        }
        salesReader.readAsArrayBuffer(salesReport)
      } catch (err) {
        reject(err)
      }
    }
    reader.readAsArrayBuffer(loadReport)
  })
}

function parseFile(file, buffer) {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  return XLSX.utils.sheet_to_json(firstSheet, { 
    raw: false,
    defval: ''
  })
}

function getLast4Digits(ref) {
  const numbers = ref.toString().replace(/\D/g, '')
  return numbers.slice(-4)
}

function matchData(loadData, salesData) {
  const supplierRefMap = new Map()
  salesData.forEach(sale => {
    const supplierRef = sale['Supplier Ref']
    if (supplierRef) {
      const last4 = getLast4Digits(supplierRef)
      if (last4.length === 4) {
        if (!supplierRefMap.has(last4)) {
          supplierRefMap.set(last4, [])
        }
        supplierRefMap.get(last4).push(supplierRef)
      }
    }
  })

  // Find column names
  const consignColumn = Object.keys(loadData[0]).find(col => 
    col.replace(/[\u25B2\u25BC\s]/g, '').trim() === 'Consign'
  )
  const cartonsColumn = Object.keys(loadData[0]).find(col => 
    col.includes('# Ctns')
  )

  // Group by consign number to sum cartons
  const cartonSums = new Map()
  loadData.forEach(load => {
    const consignNumber = load[consignColumn]?.toString().trim() || ''
    const cartons = parseInt(load[cartonsColumn]) || 0
    
    if (!cartonSums.has(consignNumber)) {
      cartonSums.set(consignNumber, 0)
    }
    cartonSums.set(consignNumber, cartonSums.get(consignNumber) + cartons)
  })

  // Create unique entries based on consign numbers
  const uniqueConsigns = [...new Set(loadData.map(load => 
    load[consignColumn]?.toString().trim() || ''
  ))]

  return uniqueConsigns.map(consignNumber => {
    const last4 = getLast4Digits(consignNumber)
    const matches = supplierRefMap.get(last4) || []
    const totalCartons = cartonSums.get(consignNumber) || 0

    return {
      consignNumber,
      supplierRef: matches.length > 0 ? matches[0] : null,
      multipleMatches: matches.length > 1 ? matches : null,
      status: matches.length > 0 ? 'Matched' : 'Unmatched',
      totalCartons
    }
  })
}

export function generateExcel(data) {
  const exportData = data.map(item => ({
    'Consign Number': item.consignNumber,
    'Supplier Ref': item.supplierRef || '',
    'Status': item.status,
    'Total Cartons': item.totalCartons,
    'Multiple Matches': item.multipleMatches ? item.multipleMatches.join(', ') : ''
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Matching Report')
  XLSX.writeFile(wb, 'matching_report.xlsx')
}
