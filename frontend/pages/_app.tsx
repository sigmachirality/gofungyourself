import '../styles/globals.scss'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  console.log(process.env.BASE_PATH)
  return <Component {...pageProps} />
}

export default MyApp
