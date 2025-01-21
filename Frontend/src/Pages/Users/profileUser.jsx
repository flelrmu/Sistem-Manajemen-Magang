import React, { useState, useEffect } from "react";
import NavbarUser from "../../components/Fragment/UserFragment/NavbarUser";
import ProfileUser from "../../components/Layouts/UsersLayouts/ProfileUser";
import axios from "axios";

function ProfileUserPage() {
  const [profile, setProfile] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [statusMagang, setStatusMagang] = useState(null);
  const [periodeMagang, setPeriodeMagang] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchRecentActivities();
    fetchStatusMagang();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get("/api/user/profile");
      const profileData = response.data.data;
      setProfile(profileData);
      setPeriodeMagang(profileData.period);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const response = await axios.get("/api/user/recent-activities");
      setRecentActivities(response.data.data);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
    }
  };

  const fetchStatusMagang = async () => {
    try {
      const response = await axios.get("/api/user/status-magang");
      setStatusMagang(response.data.data);
    } catch (error) {
      console.error("Error fetching status magang:", error);
    }
  };

  const handleUpdateProfile = async (updatedProfile) => {
    try {
      await axios.put("/api/user/profile", updatedProfile);
      fetchProfile(); // Refresh profile data after update
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleUpdatePassword = async (passwordData) => {
    try {
      await axios.put("/api/user/profile/password", passwordData);
      fetchProfile(); // Refresh profile data after password update
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  return (
    <>
      <NavbarUser profile={profile} />
      <ProfileUser
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onUpdatePassword={handleUpdatePassword}
      />
    </>
  );
}

export default ProfileUserPage;
