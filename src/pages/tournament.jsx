import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import StandingsTable from "../components/StandingsTable";
import UpcomingMatches from "../components/UpcomingMatches";
import StatsCards from "../components/StatsCards";
import "../styles/tournament.css";

function Tournament({ user }) {
  const [sidebarVisible, setSidebarVisible] = useState(true);

  return (
    <>
      <Sidebar user={user} visible={sidebarVisible} />
      <Header 
        onToggleSidebar={() => setSidebarVisible(!sidebarVisible)} 
        sidebarVisible={sidebarVisible} 
      />
      <div className={`main ${!sidebarVisible ? "full" : ""}`}>
        <div className="left-column">
          <StandingsTable />
          <StatsCards />
        </div>

        <div className="right-column">
          <UpcomingMatches />
        </div>
      </div>

    </>
  );
}

export default Tournament;