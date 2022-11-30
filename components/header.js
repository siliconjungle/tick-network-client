import React from 'react'
import { Box, HStack, Spacer, Image } from '@chakra-ui/react'
import Link from 'next/link'

const Header = () => {
  return (
    <HStack
      spacing={4}
      pt={2}
      pb={2}
      pl={4}
      pr={4}
      borderWidth='0 0 1px 0'
      sx={{ display: 'flex', width: '100%' }}
    >
      <Box>
        <Link href='/'>
          <a>
            <Image
              src='/logo.png'
              alt='Silicon Jungle'
              w='196px'
              h='28px'
              sx={{ imageRendering: 'pixelated' }}
            />
          </a>
        </Link>
      </Box>
      <Spacer sx={{ flex: 1 }} />
    </HStack>
  )
}

export default Header
