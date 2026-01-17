export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Background Pattern or Image */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-background via-background to-muted/20" />
      
      {/* Content */}
      {children}
    </div>
  );
}
