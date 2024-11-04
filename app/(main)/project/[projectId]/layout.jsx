import React, { Suspense } from 'react'
import Loading from './loading'

const SingleProjectLayout = ({children}) => {
  return (
    <div className='mx-auto'>
        <Suspense fallback={<Loading/>}>
            {children}
        </Suspense>
    </div>
  )
}

export default SingleProjectLayout