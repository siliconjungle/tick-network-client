import { ChakraProvider } from '@chakra-ui/react'
import { theme } from '../config/theme'

const MyApp = ({ Component, pageProps }) => (
  <ChakraProvider theme={theme}>
    <Component {...pageProps} />
  </ChakraProvider>
)

export default MyApp
