import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const Room: NextPage = () => {
    const router = useRouter();
    const { number } = router.query;

  return (
    <div className="columns">
        <div className="column">
            Room: {number}
        </div>
        <div className="column">
            Bruh
        </div>
    </div>
  )
}

export default Room