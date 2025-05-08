import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useAuth } from '../../lib/AuthContext';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { format, parseISO, isAfter, isBefore } from 'date-fns';
import { API_BASE_URL } from '../../lib/apiConfig';
import type { Timeout } from 'node:timers';

// Types for attendance data
interface Employee {
  id: number;
  employee_name: string;
  employee_id: string;
  employee_role: string;
  branch_name: string;
}

interface Student {
  id: number;
  student_name: string;
  student_id: string;
  branch_name: string;
}

interface EmployeeAttendance {
  id?: number;
  employee: number;
  employee_name: string;
  employee_role: string;
  employee_id: string;
  branch_name: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: string;
  remarks: string | null;
}

interface StudentAttendance {
  id?: number;
  student: number;
  student_name: string;
  student_id: string;
  branch_name: string;
  date: string;
  time_in: string | null;
  time_out: string | null;
  status: string;
  remarks: string | null;
}

const AttendancePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [pendingStartDate, setPendingStartDate] = useState<string>(todayStr);
  const [pendingEndDate, setPendingEndDate] = useState<string>(todayStr);
  const [filterApplied, setFilterApplied] = useState(false);
  const [employeeAttendance, setEmployeeAttendance] = useState<EmployeeAttendance[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState<boolean>(true);
  const [studentLoading, setStudentLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);
  const [showFilter, setShowFilter] = useState<boolean>(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState<boolean>(false);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);

  // Get auth token from localStorage
  const getAuthToken = (): string | null => {
    return localStorage.getItem('access_token');
  };

  // Redirect if not authenticated or not SuperAdmin
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (user?.role !== 'SuperAdmin') {
      // Redirect to appropriate dashboard based on role
      const roleToRoute = {
        BranchManager: '/branch-manager/dashboard',
        Counsellor: '/counsellor/dashboard',
        Receptionist: '/receptionist/dashboard',
        BankManager: '/bank-manager/dashboard',
        Student: '/student/dashboard'
      };
      
      navigate(roleToRoute[user?.role as keyof typeof roleToRoute] || '/login');
    }
  }, [user, isAuthenticated, authLoading, navigate]);

  // Helper to check if attendance data is loaded
  const isAttendanceDataLoaded = (emp: any[], stud: any[]): boolean => Array.isArray(emp) && emp.length > 0 || Array.isArray(stud) && stud.length > 0;

  // On mount, fetch all attendance data (no filter) with auto-retry
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== 'SuperAdmin') return;
    let retryTimeout: NodeJS.Timeout;
    let cancelled = false;
    const fetchAllData = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }
      setIsLoading(true);
      setShowError(false);
      try {
        await Promise.all([
          fetchEmployees(token, false),
          fetchStudents(token, false),
          fetchAttendanceData(token, '', '', false),
          fetchStudentAttendanceData(token, '', '', false)
        ]);
        if (!cancelled) {
          setIsLoading(false);
          setInitialDataLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setShowError(true);
          setIsLoading(true);
          // Retry after 2 seconds
          retryTimeout = setTimeout(fetchAllData, 2000);
        }
      }
    };
    fetchAllData();
    return () => {
      cancelled = true;
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isAuthenticated, authLoading, navigate, user?.role]);

  // Fetch employee data
  const fetchEmployees = async (token: string, showErr = true) => {
    try {
      console.log('Fetching employees from API...');
      const employeesResponse = await axios.get(
        `${API_BASE_URL}/employees/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Employees API response data:', employeesResponse.data);
      
      // Handle different response formats
      let employeeData: any[] = [];
      if (Array.isArray(employeesResponse.data)) {
        employeeData = employeesResponse.data;
      } else if (employeesResponse.data.results && Array.isArray(employeesResponse.data.results)) {
        employeeData = employeesResponse.data.results;
      } else if (employeesResponse.data.data && Array.isArray(employeesResponse.data.data)) {
        employeeData = employeesResponse.data.data;
      }
      
      // If no employee data was found, show a clear error message
      if (employeeData.length === 0) {
        console.warn('No employee data returned from API');
        setError('No employee data found. The API returned an empty list.');
        // Use fallback data
        useFallbackEmployeeData();
        return;
      }
      
      // Format employee data to match our interface based on the actual API response
      const formattedEmployees = employeeData.map(employee => ({
        id: employee.id,
        employee_name: employee.user ? 
          `${employee.user.first_name || ''} ${employee.user.last_name || ''}`.trim() || 
          `Employee ${employee.id}` : 
          `Employee ${employee.id}`,
        employee_id: employee.employee_id || `EMP-${employee.id}`,
        employee_role: employee.user?.role || 'Staff',
        branch_name: employee.branch_name || 'Main Branch'
      }));
      
      console.log('Formatted employee data:', formattedEmployees);
      setEmployees(formattedEmployees);
      
      // Fetch employee attendance
      await fetchAttendanceData(token, '', '', showErr);
    } catch (err: any) {
      if (showErr) setShowError(true);
      console.error('Error fetching employee data:', err);
      const errorDetail = err.response?.data?.detail || 'Unknown error';
      const errorStatus = err.response?.status || 'No status code';
      // setError(`Failed to load employee data: ${errorDetail} (Status: ${errorStatus})`);
      
      // If unauthorized (401), redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      
      // Use fallback data if API fails
      useFallbackEmployeeData();
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Use fallback employee data when API fails
  const useFallbackEmployeeData = () => {
    console.log('Using fallback employee data');
    
    // Fallback employee data
    const fallbackEmployees = [
      {
        id: 1,
        employee_name: 'John Doe',
        employee_id: 'EMP-001',
        employee_role: 'Manager',
        branch_name: 'Main Branch'
      },
      {
        id: 2,
        employee_name: 'Jane Smith',
        employee_id: 'EMP-002',
        employee_role: 'Assistant',
        branch_name: 'Main Branch'
      },
      {
        id: 3,
        employee_name: 'Robert Johnson',
        employee_id: 'EMP-003',
        employee_role: 'Counsellor',
        branch_name: 'West Branch'
      },
      {
        id: 4,
        employee_name: 'Sarah Williams',
        employee_id: 'EMP-004',
        employee_role: 'Receptionist',
        branch_name: 'East Branch'
      },
      {
        id: 5,
        employee_name: 'Michael Brown',
        employee_id: 'EMP-005',
        employee_role: 'Teacher',
        branch_name: 'South Branch'
      },
      {
        id: 6,
        employee_name: 'Emily Davis',
        employee_id: 'EMP-006',
        employee_role: 'Administrator',
        branch_name: 'North Branch'
      }
    ];
    
    setEmployees(fallbackEmployees);
    
    // Create default attendance records using fallback data
    const defaultEmployeeAttendance = fallbackEmployees.map(employee => ({
      employee: employee.id,
      employee_name: employee.employee_name,
      employee_id: employee.employee_id,
      employee_role: employee.employee_role,
      branch_name: employee.branch_name,
      date: todayStr,
      time_in: null,
      time_out: null,
      status: 'Present',
      remarks: null
    }));
    
    setEmployeeAttendance(defaultEmployeeAttendance);
  };

  // Fetch student data
  const fetchStudents = async (token: string, showErr = true) => {
    try {
      console.log('Fetching students from API...');
      const studentsResponse = await axios.get(
        `${API_BASE_URL}/students/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Students API response data:', studentsResponse.data);
      
      // Handle different response formats
      let studentData: any[] = [];
      if (Array.isArray(studentsResponse.data)) {
        studentData = studentsResponse.data;
      } else if (studentsResponse.data.results && Array.isArray(studentsResponse.data.results)) {
        studentData = studentsResponse.data.results;
      } else if (studentsResponse.data.data && Array.isArray(studentsResponse.data.data)) {
        studentData = studentsResponse.data.data;
      }
      
      // If no student data was found, show a clear error message
      if (studentData.length === 0) {
        console.warn('No student data returned from API');
        if (!error) { // Only set if we don't already have an employee error
          setError('No student data found. The API returned an empty list.');
        }
        // Use fallback data
        useFallbackStudentData();
        return;
      }
      
      // Format student data to match our interface based on the actual API response
      const formattedStudents = studentData.map(student => ({
        id: student.id,
        student_name: student.user ? 
          `${student.user.first_name || ''} ${student.user.last_name || ''}`.trim() || 
          `Student ${student.id}` : 
          `Student ${student.id}`,
        student_id: student.student_id || `STU-${student.id}`,
        branch_name: student.branch_name || 'Main Branch'
      }));
      
      console.log('Formatted student data:', formattedStudents);
      setStudents(formattedStudents);
      
      // Now check if there's attendance data for students
      await fetchStudentAttendanceData(token, '', '', showErr);
    } catch (err: any) {
      if (showErr) setShowError(true);
      console.error('Error fetching student data:', err);
      const errorDetail = err.response?.data?.detail || 'Unknown error';
      const errorStatus = err.response?.status || 'No status code';
      
      if (!error) { // Only set if we don't already have an employee error
      }
      
      // If unauthorized (401), redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
        return;
      }
      
      // Use fallback data if API fails
      useFallbackStudentData();
    } finally {
      setStudentLoading(false);
    }
  };

  // Use fallback student data when API fails
  const useFallbackStudentData = () => {
    console.log('Using fallback student data');
    
    // Fallback student data
    const fallbackStudents = [
      {
        id: 1,
        student_name: 'Alex Brown',
        student_id: 'STU-001',
        branch_name: 'Main Branch'
      },
      {
        id: 2,
        student_name: 'Sara Wilson',
        student_id: 'STU-002',
        branch_name: 'Main Branch'
      },
      {
        id: 3,
        student_name: 'Michael Davis',
        student_id: 'STU-003',
        branch_name: 'West Branch'
      },
      {
        id: 4,
        student_name: 'Emma Johnson',
        student_id: 'STU-004',
        branch_name: 'East Branch'
      },
      {
        id: 5,
        student_name: 'David Miller',
        student_id: 'STU-005',
        branch_name: 'South Branch'
      },
      {
        id: 6,
        student_name: 'Olivia Taylor',
        student_id: 'STU-006',
        branch_name: 'North Branch'
      }
    ];
    
    setStudents(fallbackStudents);
    
    // Create default attendance records using fallback data
    const defaultStudentAttendance = fallbackStudents.map(student => ({
      student: student.id,
      student_name: student.student_name,
      student_id: student.student_id,
      branch_name: student.branch_name,
      date: todayStr,
      time_in: null,
      time_out: null,
      status: 'Present',
      remarks: null
    }));
    
    setStudentAttendance(defaultStudentAttendance);
  };

  // Fetch attendance data for the selected date or prepare default attendance
  const fetchAttendanceData = async (token: string, start: string, end: string, showErr = true) => {
    try {
      let url = `${API_BASE_URL}/employee-attendance/by_date/`;
      if (start && end) {
        url += `?start_date=${start}&end_date=${end}`;
      }
      const employeeAttendanceResponse = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Employee attendance API response:', employeeAttendanceResponse.data);
      let allEmployeeAttendance: any[] = [];
      if (Array.isArray(employeeAttendanceResponse.data)) {
        allEmployeeAttendance = employeeAttendanceResponse.data;
      } else if (employeeAttendanceResponse.data.results && Array.isArray(employeeAttendanceResponse.data.results)) {
        allEmployeeAttendance = employeeAttendanceResponse.data.results;
      } else if (employeeAttendanceResponse.data.data && Array.isArray(employeeAttendanceResponse.data.data)) {
        allEmployeeAttendance = employeeAttendanceResponse.data.data;
      }
      setEmployeeAttendance(allEmployeeAttendance);
    } catch (err: any) {
      if (showErr) setShowError(true);
      console.error('Error fetching employee attendance data:', err);
      if (!error) {
        setError('Failed to load employee attendance data');
      }
      setEmployeeAttendance([]);
    }
  };

  // Fetch student attendance data
  const fetchStudentAttendanceData = async (token: string, start: string, end: string, showErr = true) => {
    try {
      let url = `${API_BASE_URL}/student-attendance/by_date/`;
      if (start && end) {
        url += `?start_date=${start}&end_date=${end}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Student attendance API response:', response.data);
      let allStudentAttendance: any[] = [];
      if (Array.isArray(response.data)) {
        allStudentAttendance = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        allStudentAttendance = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        allStudentAttendance = response.data.data;
      }
      setStudentAttendance(allStudentAttendance);
    } catch (err) {
      if (showErr) setShowError(true);
      console.error('Error fetching student attendance:', err);
      setError('Failed to fetch student attendance data');
      setStudentAttendance([]);
    }
  };

  // Handle Apply button
  const handleApply = async () => {
    setStartDate(pendingStartDate);
    setEndDate(pendingEndDate);
    setIsFiltered(true);
    setIsLoading(true);
    setShowError(false);
    setShowFilter(true);
    const token = getAuthToken();
    if (token) {
      try {
        await Promise.all([
          fetchAttendanceData(token, pendingStartDate, pendingEndDate, true),
          fetchStudentAttendanceData(token, pendingStartDate, pendingEndDate, true)
        ]);
      } catch (err) {
        setShowError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle Reset button
  const handleReset = async () => {
    setPendingStartDate(todayStr);
    setPendingEndDate(todayStr);
    setStartDate('');
    setEndDate('');
    setIsFiltered(false);
    setFilterApplied(false);
    setIsLoading(true);
    setShowError(false);
    setShowFilter(true);
    const token = getAuthToken();
    if (token) {
      try {
        await Promise.all([
          fetchAttendanceData(token, '', '', true),
          fetchStudentAttendanceData(token, '', '', true)
        ]);
      } catch (err) {
        setShowError(true);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Add no-op handlers if not implemented
  const handleEmployeeStatusChange = () => {};
  const handleStudentStatusChange = () => {};

  return (
    <Layout>
      <div className="max-w-6xl">
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">Attendance Management</h1>
          {/* Filter by Date Button */}
          {!showFilter && initialDataLoaded && (
            <div className="mb-8 flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
                onClick={() => setShowFilter(true)}
              >
                Filter by Date
              </button>
            </div>
          )}
          {/* Date Filter UI */}
          {showFilter && initialDataLoaded && (
            <div className="mb-10 flex flex-col md:flex-row md:items-end md:gap-8 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={pendingStartDate}
                  onChange={(e) => setPendingStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full md:w-64 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  disabled={employeeLoading || studentLoading}
                />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={pendingEndDate}
                  min={pendingStartDate}
                  onChange={(e) => setPendingEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full md:w-64 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  disabled={employeeLoading || studentLoading}
                />
              </div>
              <div className="flex items-end gap-2 md:mb-0 mb-2">
                <button
                  type="button"
                  onClick={handleApply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-300"
                  disabled={employeeLoading || studentLoading}
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors duration-300"
                  disabled={employeeLoading || studentLoading}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg text-gray-600">Loading attendance data...</span>
            </div>
          )}
          {/* Error Message (only for user actions) */}
          {showError && !isLoading && initialDataLoaded && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 font-medium">
              Failed to load attendance data. Please try again.
            </div>
          )}
          {/* Attendance Tables (always show after initial data load) */}
          {!isLoading && initialDataLoaded && (
            <>
              {/* Success Message */}
              {updateSuccess && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 font-medium">
                  Attendance updated successfully
                </div>
              )}
              {/* Attendance Summary Cards */}
              <div className="mb-10 grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-xl shadow flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <h3 className="text-lg font-bold text-green-800">Employee Present</h3>
                  </div>
                  <div className="text-4xl font-extrabold text-green-700">{employeeAttendance.filter(e => e.status === 'Present').length}</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 rounded-xl shadow flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    <h3 className="text-lg font-bold text-red-800">Employee Absent</h3>
                  </div>
                  <div className="text-4xl font-extrabold text-red-700">{employeeAttendance.filter(e => e.status === 'Absent').length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded-xl shadow flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <h3 className="text-lg font-bold text-green-800">Student Present</h3>
                  </div>
                  <div className="text-4xl font-extrabold text-green-700">{studentAttendance.filter(s => s.status === 'Present').length}</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 p-2 rounded-xl shadow flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    <h3 className="text-lg font-bold text-red-800">Student Absent</h3>
                  </div>
                  <div className="text-4xl font-extrabold text-red-700">{studentAttendance.filter(s => s.status === 'Absent').length}</div>
                </div>
              </div>
              {/* Tabs for different attendance types */}
              <Tabs selectedIndex={tabIndex} onSelect={(index: number) => setTabIndex(index)} className="mt-8">
                <TabList className="flex border-b mb-6">
                  <Tab className="px-6 py-3 cursor-pointer focus:outline-none border-b-2 border-transparent transition-colors hover:text-blue-600 hover:border-blue-600 aria-selected:border-blue-600 aria-selected:text-blue-600 font-semibold text-lg">
                    Employee Attendance
                  </Tab>
                  <Tab className="px-6 py-3 cursor-pointer focus:outline-none border-b-2 border-transparent transition-colors hover:text-blue-600 hover:border-blue-600 aria-selected:border-blue-600 aria-selected:text-blue-600 font-semibold text-lg">
                    Student Attendance
                  </Tab>
                </TabList>
                {/* Employee Attendance Tab */}
                <TabPanel>
                  <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Name</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">ID</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Role</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Branch</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Date</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Status</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!employeeAttendance || employeeAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 px-4 text-center text-gray-400 text-lg">
                              No employees found
                            </td>
                          </tr>
                        ) : (
                          Array.isArray(employeeAttendance) && employeeAttendance.map((record) => (
                            <tr key={`emp-${record.employee}-${record.date}`} className="border-b hover:bg-blue-50/40 transition">
                              <td className="py-4 px-6 text-base text-gray-900 font-semibold">{record.employee_name}</td>
                              <td className="py-4 px-6 text-base text-gray-700">{record.employee_id}</td>
                              <td className="py-4 px-6 text-base text-gray-700">{record.employee_role}</td>
                              <td className="py-4 px-6 text-base text-gray-700">{record.branch_name}</td>
                              <td className="py-4 px-6 text-base text-gray-700">{format(parseISO(record.date), 'yyyy-MM-dd')}</td>
                              <td className="py-4 px-6 text-base">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm transition-colors duration-200
                                  ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                  record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                  record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                  record.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                                  'bg-blue-100 text-blue-800'}`}
                                >
                                  {record.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-base">
                                <select
                                  value={record.status}
                                  onChange={(e) => handleEmployeeStatusChange(record.employee, e.target.value)}
                                  className="border border-gray-300 rounded p-2 text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Late">Late</option>
                                  <option value="Half Day">Half Day</option>
                                  <option value="On Leave">On Leave</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
                {/* Student Attendance Tab */}
                <TabPanel>
                  <div className="overflow-x-auto rounded-lg shadow border border-gray-200 bg-white">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Name</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">ID</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Branch</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Date</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Status</th>
                          <th className="py-4 px-6 text-left text-base font-bold text-gray-700 border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!studentAttendance || studentAttendance.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 px-4 text-center text-gray-400 text-lg">
                              No students found
                            </td>
                          </tr>
                        ) : (
                          Array.isArray(studentAttendance) && studentAttendance.map((record) => (
                            <tr key={`stud-${record.student}-${record.date}`} className="border-b hover:bg-blue-50/40 transition">
                              <td className="py-4 px-6 text-base text-gray-900 font-semibold">{record.student_name}</td>
                              <td className="py-4 px-6 text-base text-gray-700">{record.student_id}</td>
                              <td className="py-4 px-6 text-base text-gray-700">{record.branch_name}</td>
                              <td className="py-4 px-6 text-base text-gray-700">{format(parseISO(record.date), 'yyyy-MM-dd')}</td>
                              <td className="py-4 px-6 text-base">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm transition-colors duration-200
                                  ${record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                  record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                  record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                  record.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                                  record.status === 'Not Marked' ? 'bg-gray-200 text-gray-600' :
                                  'bg-blue-100 text-blue-800'}`}
                                >
                                  {record.status}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-base">
                                <select
                                  value={record.status}
                                  onChange={(e) => handleStudentStatusChange(record.student, e.target.value)}
                                  className="border border-gray-300 rounded p-2 text-base focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                                >
                                  <option value="Present">Present</option>
                                  <option value="Absent">Absent</option>
                                  <option value="Late">Late</option>
                                  <option value="Half Day">Half Day</option>
                                  <option value="On Leave">On Leave</option>
                                </select>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </TabPanel>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AttendancePage; 