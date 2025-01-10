import React from 'react'
import styled from 'styled-components'
import { generateExcel } from '../utils/fileProcessor'

const ReportContainer = styled.div`
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
`

const ReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`

const Stats = styled.div`
  display: flex;
  gap: 2rem;
`

const StatItem = styled.div`
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${props => props.color || '#ffd700'};
  }
  
  .label {
    font-size: 0.9rem;
    color: #888;
  }
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
`

const Th = styled.th`
  background-color: #ffd700;
  color: #000;
  padding: 1rem;
  text-align: left;
`

const Td = styled.td`
  padding: 0.8rem;
  border-bottom: 1px solid #444;
  color: ${props => props.unmatched ? '#ff4444' : '#ffd700'};
`

const DownloadButton = styled.button`
  background-color: #ffd700;
  color: #000;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #ffed4a;
  }
`

function MatchingReport({ data }) {
  const matchedCount = data.filter(row => row.supplierRef).length
  const unmatchedCount = data.length - matchedCount
  const matchRate = ((matchedCount / data.length) * 100).toFixed(1)

  const handleDownload = () => {
    generateExcel(data)
  }

  return (
    <ReportContainer>
      <ReportHeader>
        <Stats>
          <StatItem>
            <div className="value">{data.length}</div>
            <div className="label">Total Records</div>
          </StatItem>
          <StatItem color="#4CAF50">
            <div className="value">{matchedCount}</div>
            <div className="label">Matched</div>
          </StatItem>
          <StatItem color="#ff4444">
            <div className="value">{unmatchedCount}</div>
            <div className="label">Unmatched</div>
          </StatItem>
          <StatItem>
            <div className="value">{matchRate}%</div>
            <div className="label">Match Rate</div>
          </StatItem>
        </Stats>
        <DownloadButton onClick={handleDownload}>
          Download Report
        </DownloadButton>
      </ReportHeader>

      <Table>
        <thead>
          <tr>
            <Th>Consign Number</Th>
            <Th>Supplier Ref</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <Td unmatched={!row.supplierRef}>{row.consignNumber}</Td>
              <Td>{row.supplierRef || '-'}</Td>
              <Td>{row.supplierRef ? 'Matched' : 'Unmatched'}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ReportContainer>
  )
}

export default MatchingReport
