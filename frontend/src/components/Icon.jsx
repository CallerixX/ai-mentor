import React from 'react'

const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

const Icon = ({ name, size = 16, className = '', ...props }) => {
  return (
    <img
      src={`${basePath}/icons/${name}.svg`}
      alt=""
      width={size}
      height={size}
      className={`icon ${className}`}
      draggable={false}
      {...props}
    />
  )
}

export default Icon
