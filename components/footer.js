import React from 'react'
import { Box } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Box
      as='footer'
      p='0.5em'
      pb='0.75em'
      display='flex'
      align='center'
      justifyContent='center'
      borderWidth='1px 0 0 0'
    >
      All content copyright James Addison © 2022 • All rights reserved.
    </Box>
  )
}

export default Footer
