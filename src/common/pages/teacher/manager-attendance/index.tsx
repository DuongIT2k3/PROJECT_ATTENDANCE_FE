import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AttendanceIndexPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to main attendance page
    navigate("/teacher/attendance", { replace: true });
  }, [navigate]);

  return null;
};

export default AttendanceIndexPage;