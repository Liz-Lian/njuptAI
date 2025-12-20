import User from "./User";

function Header() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm h-16 flex items-center justify-end px-6 relative">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <span className="text-2xl">🌸</span>
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          柚子 AI 助手
        </h1>
      </div>
      <User />
    </header>
  );
}

export default Header;
