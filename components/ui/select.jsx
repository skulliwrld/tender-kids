"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Select = ({ value, onValueChange, children, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  const handleItemClick = (itemValue) => {
    if (onValueChange) {
      onValueChange(itemValue)
    }
    setIsOpen(false)
  }

  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (child && child.type === SelectTrigger) {
          return React.cloneElement(child, { 
            value, 
            onClick: () => setIsOpen(!isOpen),
            isOpen 
          })
        }
        if (child && child.type === SelectContent && isOpen) {
          return React.cloneElement(child, { onItemClick: handleItemClick, value })
        }
        return null
      })}
    </div>
  )
}

const SelectGroup = ({ children, ...props }) => {
  return <div {...props}>{children}</div>
}

const SelectValue = ({ children, placeholder }) => {
  return <span className="text-gray-900">{children || placeholder || "Select an option"}</span>
}

const SelectTrigger = React.forwardRef(({ className, children, onClick, isOpen, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}>
    {children}
    <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", isOpen && "rotate-180")} />
  </button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ className, children, onItemClick, value, position = "popper", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white text-gray-950 shadow-md",
        className
      )}
      {...props}>
      <div className="p-1">
        {React.Children.map(children, (child) => {
          if (child && child.type === SelectItem) {
            return React.cloneElement(child, { onClick: () => onItemClick(child.props.value) })
          }
          return child
        })}
      </div>
    </div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectLabel = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef(({ className, children, value, onClick, ...props }, ref) => (
  <div
    ref={ref}
    onClick={() => onClick && onClick(value)}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    role="option"
    value={value}
    {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <Check className="h-4 w-4" />
    </span>
    <span>{children}</span>
  </div>
))
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-gray-100", className)}
    {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}
