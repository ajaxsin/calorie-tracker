import { NavLink } from "react-router-dom";
import { CircleHelp, Flame, Leaf, Sparkles, Utensils } from "lucide-react";

const Sidebar = () => (
  <aside className="sidebar">
    <div className="brand"><span className="brand-mark"><Leaf size={18} /></span><span>AJX90<span className="brand-dot">.</span></span></div>
    <nav>
      <NavLink to="/" end className={({ isActive }) => isActive ? "nav-active" : ""} data-testid="dashboard-navigation"><Utensils size={18} />Daily dashboard</NavLink>
      <NavLink to="/history" className={({ isActive }) => isActive ? "nav-active" : ""} data-testid="history-navigation"><Flame size={18} />Meal history</NavLink>
    </nav>
    <div className="side-note"><div className="note-icon"><Sparkles size={16} /></div><p><strong>Good food, clear data.</strong><br />Paste what you ate and let your day take shape.</p></div>
    <div className="help"><CircleHelp size={16} />Nutrition estimates are a guide</div>
  </aside>
);

export default Sidebar;
