import { useRef, useEffect } from 'react'
import { VStack, Heading, Box, Text } from '@chakra-ui/react'
import Layout from 'components/layout'
import Game from 'core/game'

const game = new Game()

const Home = () => {
  const canvasRef = useRef()
  const canvas3dRef = useRef()

  useEffect(() => {
    if (canvasRef.current && canvas3dRef.current) {
      game.init(canvasRef.current, canvas3dRef.current)

      return () => {
        game.shutdown()
      }
    }
  }, [canvasRef, canvas3dRef])

  return (
    <Layout>
      <VStack align='stretch' w='100%' spacing={4} shouldWrapChildren>
        <Heading as='h1' size='2xl'>
          Networking client
        </Heading>
        <Text>
          A demo networking client.
        </Text>
        <Box
          border="1px"
          borderRadius="4px"
        >
          <canvas
            id="game"
            ref={canvasRef}
            border="1px"
            borderradius={4}
            width={640}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              borderTop: '1px solid white',
              borderBottom: '1px solid white',
            }}
            tabIndex="1"
          >
            Canvas not supported by your browser.
          </canvas>
          <canvas
            id="game3d"
            ref={canvas3dRef}
            border="1px"
            borderradius={4}
            width={640}
            height={480}
            style={{
              width: '100%',
              height: '100%',
              borderTop: '1px solid white',
              borderBottom: '1px solid white',
            }}
            tabIndex="1"
          >
            Canvas not supported by your browser.
          </canvas>
        </Box>
      </VStack>
    </Layout>
  )
}

export default Home
