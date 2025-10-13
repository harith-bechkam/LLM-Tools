import { useState } from "react"
import ResumeScorer from "./ResumeScorer/index"
import Search from "./Search/index"

import './style.css'

export default function App() {
  const [activeMenu, setActiveMenu] = useState("searchAISummary")

  const menuItems = [
    { key: "searchAISummary", label: "Search & AI Summary" },
    { key: "resume-scorer", label: "Resume Scorer" },
  ]

  return (
    <>
      <nav className="navbar">
        {/* <div className="navbar-logo">MyTools</div> */}
        <ul className="navbar-menu">
          <li className="menu-item">
            Tools
            <ul className="submenu">
              {menuItems.map(item => (
                <li
                  key={item.key}
                  className={activeMenu == item.key ? "submenu-item active" : "submenu-item"}
                  onClick={() => setActiveMenu(item.key)}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>

      <div className="main-content">
        {activeMenu == "searchAISummary" && <Search />}
        {activeMenu == "resume-scorer" && <ResumeScorer />}
      </div>
    </>
  )
}
