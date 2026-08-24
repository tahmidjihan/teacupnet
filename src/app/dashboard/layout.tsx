import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardAuthGuard } from '@/components/dashboard-auth-guard';
import { SiteHeader } from '@/components/site-header';
import { EmailVerificationBanner } from '@/components/email-verification-banner';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthGuard>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant='inset' />
        <SidebarInset className='flex flex-col bg-background'>
          <SiteHeader />

          {/* Main content area with responsive padding */}
          <main className='flex-1 overflow-auto'>
            <div
              className={cn(
                // Container with max width and centered on large screens
                'mx-auto w-full',
                'px-4 sm:px-6 lg:px-8',
                'py-4 md:py-6 lg:py-8',

                // Responsive max width
                'max-w-7xl',
              )}
            >
              {/* Content wrapper with consistent spacing */}
              <div className='space-y-6 md:space-y-8'>
                {/* Page header can be added here if needed */}
                <EmailVerificationBanner />

                {/* Main content */}
                <div className='min-h-[calc(100vh-var(--header-height)-4rem)]'>
                  {children}
                </div>

                {/* Optional footer for dashboard */}
                <footer className='border-t py-4 text-center text-sm text-muted-foreground'>
                  <p>
                    © {new Date().getFullYear()} Your Company. All rights
                    reserved.
                  </p>
                </footer>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </DashboardAuthGuard>
  );
}
