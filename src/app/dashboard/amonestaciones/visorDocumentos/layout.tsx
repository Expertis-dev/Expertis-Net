

export default function VisorDocLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
    <div className="flex flex-col -m-4">
            {/* Header */}
            

            {/* Prev PDF */}
            {/* Background */}
            {children}
        </div>
  );
}