import React, { useState } from 'react'
import styled from 'styled-components'
import { processFiles } from '../utils/fileProcessor'

const UploadContainer = styled.div`
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`

const FileInput = styled.input`
  display: none;
`

const UploadButton = styled.label`
  background-color: #ffd700;
  color: #000;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: inline-block;
  margin: 0.5rem;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ffed4a;
  }
`

const AnalyzeButton = styled.button`
  background-color: ${props => props.disabled ? '#666' : '#ffd700'};
  color: #000;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: block;
  margin: 1.5rem auto;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: ${props => props.disabled ? '#666' : '#ffed4a'};
  }
`

const FileStatus = styled.div`
  margin-top: 1rem;
  padding: 0.5rem;
  display: flex;
  gap: 1rem;
`

const FileIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.uploaded ? '#4CAF50' : '#666'};
    display: inline-block;
  }
`

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-top: 1rem;
`

const SupportedFormats = styled.div`
  color: #888;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  text-align: center;
`

function FileUpload({ onFilesProcessed }) {
  const [error, setError] = useState('')
  const [loadReport, setLoadReport] = useState(null)
  const [salesReport, setSalesReport] = useState(null)
  const [processing, setProcessing] = useState(false)

  const handleFileChange = (event, type) => {
    const file = event.target.files[0]
    if (!file) return

    const extension = file.name.split('.').pop().toLowerCase()
    const supportedFormats = ['csv', 'xlsx', 'xls', 'tsv']
    
    if (!supportedFormats.includes(extension)) {
      setError(`Unsupported file format. Please use: ${supportedFormats.join(', ')}`)
      return
    }

    setError('')
    if (type === 'load') {
      setLoadReport(file)
    } else {
      setSalesReport(file)
    }
  }

  const handleAnalyze = async () => {
    if (!loadReport || !salesReport) {
      setError('Please upload both files first')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const result = await processFiles(loadReport, salesReport)
      onFilesProcessed(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <UploadContainer>
      <div>
        <FileInput
          type="file"
          id="loadReport"
          accept=".csv,.xlsx,.xls,.tsv"
          onChange={(e) => handleFileChange(e, 'load')}
        />
        <UploadButton htmlFor="loadReport">
          Upload Load Report
        </UploadButton>

        <FileInput
          type="file"
          id="salesReport"
          accept=".csv,.xlsx,.xls,.tsv"
          onChange={(e) => handleFileChange(e, 'sales')}
        />
        <UploadButton htmlFor="salesReport">
          Upload Sales Report
        </UploadButton>
      </div>

      <SupportedFormats>
        Supported formats: CSV, Excel (XLSX, XLS), TSV
      </SupportedFormats>

      <FileStatus>
        <FileIndicator uploaded={loadReport}>
          <span></span>
          Load Report: {loadReport ? loadReport.name : 'Not uploaded'}
        </FileIndicator>
        <FileIndicator uploaded={salesReport}>
          <span></span>
          Sales Report: {salesReport ? salesReport.name : 'Not uploaded'}
        </FileIndicator>
      </FileStatus>

      <AnalyzeButton 
        onClick={handleAnalyze} 
        disabled={!loadReport || !salesReport || processing}
      >
        {processing ? 'Processing...' : 'Analyse Data'}
      </AnalyzeButton>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploadContainer>
  )
}

export default FileUpload
