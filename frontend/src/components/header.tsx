const Header = () => {
  return (
    <header>
      <div className="max-w-[960px] my-0 mx-[auto] flex justify-between items-center">
        <span>LOGO</span>
        <ul className="flex gap-5">
          <li>
            <a href="/chat">Анонимный чат</a>
          </li>
          <li>
            <a href="/public">Групповой анонимный чат</a>
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
