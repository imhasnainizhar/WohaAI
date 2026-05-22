export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/80 backdrop-blur-sm">
      <div className="flex animate-spinGap">
        <span className="mx-1 h-2.5 w-2.5 animate-dot rounded-full bg-white" />
        <span className="mx-1 h-2.5 w-2.5 animate-dot2 rounded-full bg-white" />
        <span className="mx-1 h-2.5 w-2.5 animate-dot3 rounded-full bg-white" />
      </div>
    </div>
  );
}
