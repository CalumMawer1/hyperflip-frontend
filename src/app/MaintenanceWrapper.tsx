
"use client";

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const isOffline = process.env.NEXT_PUBLIC_SITE_OFFLINE === "true";

  if (isOffline) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#04e6e0]/10 via-transparent to-[#8B5CF6]/10 z-0"></div>
        <div className="absolute -left-40 top-20 w-[500px] h-[500px] rounded-full bg-[#04e6e0]/10 blur-[120px] z-0"></div>

        <div className="z-10 text-center px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#04e6e0] mb-4 tracking-wide">
            🚧 Site Under Maintenance
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-xl mx-auto">
            We're making improvements. Please check back soon!
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
