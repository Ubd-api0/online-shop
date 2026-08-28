import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import { FiMenu, FiLogOut, FiPackage, FiShoppingBag } from "react-icons/fi";
import { AiOutlineGift } from "react-icons/ai";
import { MdOutlineLocalOffer } from "react-icons/md";
import { BiMessageSquareDetail } from "react-icons/bi";
import { backend_url, server } from "../../../server";
import ThemeToggle from "../../Layout/ThemeToggle";

const quick = [
  { to: "/dashboard-coupouns", icon: AiOutlineGift },
  { to: "/dashboard-events", icon: MdOutlineLocalOffer },
  { to: "/dashboard-products", icon: FiShoppingBag },
  { to: "/dashboard-orders", icon: FiPackage },
  { to: "/dashboard-messages", icon: BiMessageSquareDetail },
];

const DashboardHeader = ({ onMenuClick }) => {
  const { seller } = useSelector((state) => state.seller);
  const { user } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.get(`${server}/user/logout`, { withCredentials: true });
      toast.success("Logged out");
      navigate("/login");
      window.location.reload(true);
    } catch (e) {
      toast.error("Could not log out");
    }
  };

  const avatar = seller?.avatar || user?.avatar;

  return (
    <header className="fixed top-0 left-0 right-0 h-[64px] bg-surface border-b border-border z-[90] flex items-center justify-between px-3 sm:px-5">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-content"
          aria-label="Open menu"
        >
          <FiMenu size={24} />
        </button>
        <Link to="/dashboard" className="font-bold text-brand text-lg">
          Store Admin
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden xl:flex items-center gap-4">
          {quick.map(({ to, icon: Icon }) => (
            <Link key={to} to={to} className="text-muted hover:text-brand">
              <Icon size={24} />
            </Link>
          ))}
        </div>
        <ThemeToggle size={20} />
        <Link to="/" className="hidden sm:block text-sm text-muted hover:text-brand">
          View store
        </Link>
        {avatar && (
          <Link to={seller?._id ? `/shop/${seller._id}` : "/profile"}>
            <img
              src={`${backend_url}${avatar}`}
              alt=""
              className="w-9 h-9 rounded-full object-cover border border-border"
            />
          </Link>
        )}
        <button onClick={logout} className="text-muted hover:text-brand" aria-label="Log out">
          <FiLogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
