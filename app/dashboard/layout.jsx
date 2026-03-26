import NavigationWrapper from "@/components/shared-component/NavigationWrapper";

export default function DashboardLayout({ children }) {
  return (
    <NavigationWrapper>
        {children}
    </NavigationWrapper>
  )
}
