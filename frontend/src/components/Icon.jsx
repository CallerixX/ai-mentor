import React from 'react'

const Icon = ({ name, size = 16, className = '', ...props }) => {
  return (
    <img
      src={`/icons/${name}.svg`}
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
