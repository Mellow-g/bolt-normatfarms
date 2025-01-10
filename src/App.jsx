import React, { useState } from 'react'
import styled from 'styled-components'
import FileUpload from './components/FileUpload'
import MatchingReport from './components/MatchingReport'
import { processFiles } from './utils/fileProcessor'

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`

const Title = styled.h1`
  color: #ffd700;
  text-align: center;
  margin-bottom: 2rem;
`

function App() {
  const [matchingData, setMatchingData] = useState(null)

  const handleFilesProcessed = (data) => {
    setMatchingData(data)
  }

  return (
    <AppContainer>
      <Title>File Matcher</Title>
      <FileUpload onFilesProcessed={handleFilesProcessed} />
      {matchingData && <MatchingReport data={matchingData} />}
    </AppContainer>
  )
}

export default App
