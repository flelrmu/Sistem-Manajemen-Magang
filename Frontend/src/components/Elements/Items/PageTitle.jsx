import React from 'react'

function PageTitle(props) {
    const { children } = props
  return (
    <h1 className="text-2xl font-bold">{children}</h1>
  )
}

export default PageTitle