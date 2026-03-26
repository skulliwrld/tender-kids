import NavigationWrapper from "@/components/shared-component/NavigationWrapper";


function RootLayout({children}) {
    return (
      <NavigationWrapper>
          {children}
      </NavigationWrapper>
    )
  }
  
  export default RootLayout
