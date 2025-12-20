function User() {
  return (
    <div className="p-4 border-t border-gray-100">
      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          U
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">User</p>
          <p className="text-xs text-gray-500 truncate">Free Plan</p>
        </div>
      </div>
    </div>
  );
}

export default User;
