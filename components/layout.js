import React from 'react'
import { Container, Box } from '@chakra-ui/react'
import Header from 'components/header'
import Footer from 'components/footer'

const Layout = ({ children }) => {
  return (
    <Box h="100vh" sx={{ display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Container
        as='main'
        maxW='container.lg'
        centerContent
        pt='1.5em'
        pb='1.5em'
        flexGrow="1"
      >
        {children}
      </Container>
      <Footer />
    </Box>
  )
}

export default Layout
