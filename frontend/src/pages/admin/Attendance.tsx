import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import axios from 'axios';
import { useAuth } from '../../lib/AuthContext';
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { format } from 'date-fns';
import { API_BASE_URL } from '../../lib/apiConfig';

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
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [employeeAttendance, setEmployeeAttendance] = useState<EmployeeAttendance[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [employeeLoading, setEmployeeLoading] = useState<boolean>(true);
  const [studentLoading, setStudentLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

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

  // Fetch all employees and students first
  useEffect(() => {
    // Only fetch data if authenticated and SuperAdmin
    if (authLoading || !isAuthenticated || user?.role !== 'SuperAdmin') return;
    
    const fetchUsersData = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }
      
      setEmployeeLoading(true);
      setStudentLoading(true);
      setError(null);
      
      // Fetch employees
      fetchEmployees(token);
      
      // Fetch students
      fetchStudents(token);
    };
    
    fetchUsersData();
  }, [isAuthenticated, authLoading, navigate, user?.role]);

  // Fetch employee data
  const fetchEmployees = async (token: string) => {
    try {
      console.log('Fetching employees from API...');
      const employeesResponse = await axios.get(
        `${API_BASE_URL}/api/employees/`,
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
      await fetchAttendanceData(token);
    } catch (err: any) {
      console.error('Error fetching employee data:', err);
      const errorDetail = err.response?.data?.detail || 'Unknown error';
      const errorStatus = err.response?.status || 'No status code';
      setError(`Failed to load employee data: ${errorDetail} (Status: ${errorStatus})`);
      
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
      date: selectedDate,
      time_in: null,
      time_out: null,
      status: 'Present',
      remarks: null
    }));
    
    setEmployeeAttendance(defaultEmployeeAttendance);
  };

  // Fetch student data
  const fetchStudents = async (token: string) => {
    try {
      console.log('Fetching students from API...');
      const studentsResponse = await axios.get(
        `${API_BASE_URL}/api/students/`,
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
      await fetchStudentAttendanceData(token);
    } catch (err: any) {
      console.error('Error fetching student data:', err);
      const errorDetail = err.response?.data?.detail || 'Unknown error';
      const errorStatus = err.response?.status || 'No status code';
      
      if (!error) { // Only set if we don't already have an employee error
        setError(`Failed to load student data: ${errorDetail} (Status: ${errorStatus})`);
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
      date: selectedDate,
      time_in: null,
      time_out: null,
      status: 'Present',
      remarks: null
    }));
    
    setStudentAttendance(defaultStudentAttendance);
  };

  // Fetch attendance data for the selected date or prepare default attendance
  const fetchAttendanceData = async (token: string) => {
    try {
      // Fetch employee attendance for selected date
      const employeeAttendanceResponse = await axios.get(
        `${API_BASE_URL}/api/employee-attendance/?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Employee attendance API response:', employeeAttendanceResponse.data);
      
      // Handle different API response formats
      let existingAttendanceData: any[] = [];
      if (Array.isArray(employeeAttendanceResponse.data)) {
        existingAttendanceData = employeeAttendanceResponse.data;
      } else if (employeeAttendanceResponse.data.results && Array.isArray(employeeAttendanceResponse.data.results)) {
        existingAttendanceData = employeeAttendanceResponse.data.results;
      } else if (employeeAttendanceResponse.data.data && Array.isArray(employeeAttendanceResponse.data.data)) {
        existingAttendanceData = employeeAttendanceResponse.data.data;
      }
      
      // Create attendance records for all employees
      const allEmployeeAttendance = employees.map(employee => {
        // Try to find existing attendance record for this employee
        const existingRecord = existingAttendanceData.find(record => record.employee === employee.id);
        
        if (existingRecord) {
          // Use existing record but ensure employee details are up to date
          return {
            ...existingRecord,
            employee_name: employee.employee_name,
            employee_id: employee.employee_id,
            employee_role: employee.employee_role,
            branch_name: employee.branch_name
          };
        } else {
          // Create new attendance record for this employee
          return {
            employee: employee.id,
            employee_name: employee.employee_name,
            employee_id: employee.employee_id,
            employee_role: employee.employee_role,
            branch_name: employee.branch_name,
            date: selectedDate,
            time_in: null,
            time_out: null,
            status: 'Present',
            remarks: null
          };
        }
      });
      
      console.log('All employee attendance records:', allEmployeeAttendance);
      setEmployeeAttendance(allEmployeeAttendance);
      
    } catch (err: any) {
      console.error('Error fetching employee attendance data:', err);
      if (!error) {
        setError('Failed to load employee attendance data');
      }
      
      // Create default attendance data for all employees
      const defaultEmployeeAttendance = employees.map(employee => ({
        employee: employee.id,
        employee_name: employee.employee_name,
        employee_id: employee.employee_id,
        employee_role: employee.employee_role,
        branch_name: employee.branch_name,
        date: selectedDate,
        time_in: null,
        time_out: null,
        status: 'Present',
        remarks: null
      }));
      
      setEmployeeAttendance(defaultEmployeeAttendance);
    }
  };

  // Fetch student attendance data
  const fetchStudentAttendanceData = async (token: string) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/student-attendance/?date=${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      console.log('Student attendance API response:', response.data);
      
      let existingAttendanceData: any[] = [];
      if (Array.isArray(response.data)) {
        existingAttendanceData = response.data;
      } else if (response.data.results && Array.isArray(response.data.results)) {
        existingAttendanceData = response.data.results;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        existingAttendanceData = response.data.data;
      }
      
      // Create attendance records for all students
      const allStudentAttendance = students.map(student => {
        // Try to find existing attendance record for this student
        const existingRecord = existingAttendanceData.find(record => record.student === student.id);
        
        if (existingRecord) {
          // Use existing record but ensure student details are up to date
          return {
            ...existingRecord,
            student_name: student.student_name,
            student_id: student.student_id,
            branch_name: student.branch_name
          };
        } else {
          // Create new attendance record for this student
          return {
            student: student.id,
            student_name: student.student_name,
            student_id: student.student_id,
            branch_name: student.branch_name,
            date: selectedDate,
            time_in: null,
            time_out: null,
            status: 'Present',
            remarks: null
          };
        }
      });
      
      console.log('All student attendance records:', allStudentAttendance);
      setStudentAttendance(allStudentAttendance);
      
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      setError('Failed to fetch student attendance data');
      
      // Use default attendance data for all students
      const defaultStudentAttendance = students.map(student => ({
        student: student.id,
        student_name: student.student_name,
        student_id: student.student_id,
        branch_name: student.branch_name,
        date: selectedDate,
        time_in: null,
        time_out: null,
        status: 'Present',
        remarks: null
      }));
      
      setStudentAttendance(defaultStudentAttendance);
    }
  };

  // Handle date change
  const handleDateChange = async (date: string) => {
    setSelectedDate(date);
    const token = getAuthToken();
    if (token) {
      setEmployeeLoading(true);
      setStudentLoading(true);
      await fetchAttendanceData(token);
      await fetchStudentAttendanceData(token);
      setEmployeeLoading(false);
      setStudentLoading(false);
    }
  };

  // Handle status change for employee attendance
  const handleEmployeeStatusChange = async (employeeId: number, newStatus: string) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      console.log(`Updating employee attendance ${employeeId} to status: ${newStatus}`);
      
      // Find the attendance record for this employee
      const attendanceRecord = employeeAttendance.find(item => item.employee === employeeId);
      
      let response;
      
      if (attendanceRecord?.id) {
        // This is an existing record, update it
        console.log(`Updating existing record for employee ${employeeId}`);
        response = await axios.patch(
          `${API_BASE_URL}/api/employee-attendance/${attendanceRecord.id}/`,
          { status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Update employee attendance response:', response.data);
      } else {
        // This is a new record, create it
        console.log(`Creating new record for employee ${employeeId}`);
        const newRecord = {
          employee: employeeId,
          date: selectedDate,
          status: newStatus,
          // Include any other required fields from the employee data
          remarks: null
        };
        
        response = await axios.post(
          `${API_BASE_URL}/api/employee-attendance/`,
          newRecord,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Create employee attendance response:', response.data);
      }
      
      // Update local state with the response data
      const updatedRecord = response?.data;
      
      if (updatedRecord) {
        setEmployeeAttendance(prev => {
          if (!Array.isArray(prev)) {
            console.warn('employeeAttendance is not an array when updating');
            return [];
          }
          
          // Find the index of the record to update
          const recordIndex = prev.findIndex(item => item.employee === employeeId);
          
          // Get the employee data to ensure we maintain all required display fields
          const employeeData = employees.find(emp => emp.id === employeeId);
          
          if (recordIndex === -1) {
            // Record not found, add it to the array with employee data
            return [...prev, {
              ...updatedRecord,
              employee_name: employeeData?.employee_name || `Employee #${employeeId}`,
              employee_id: employeeData?.employee_id || `ID-${employeeId}`,
              employee_role: employeeData?.employee_role || 'Unknown',
              branch_name: employeeData?.branch_name || 'Unknown'
            }];
          } else {
            // Update the existing record
            const updatedAttendance = [...prev];
            updatedAttendance[recordIndex] = {
              ...updatedAttendance[recordIndex],
              ...updatedRecord,
              status: newStatus
            };
            return updatedAttendance;
          }
        });
      } else {
        // If we don't have a response, just update the status in the local state
        setEmployeeAttendance(prev => {
          if (!Array.isArray(prev)) {
            console.warn('employeeAttendance is not an array when updating');
            return [];
          }
          return prev.map(item => 
            item.employee === employeeId ? { ...item, status: newStatus } : item
          );
        });
      }
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
    } catch (err: any) {
      console.error('Error updating employee attendance:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      setError('Failed to update employee attendance status');
      // If unauthorized (401), redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
      }
      
      // Update local state anyway to provide immediate feedback
      setEmployeeAttendance(prev => {
        if (!Array.isArray(prev)) {
          return [];
        }
        return prev.map(item => 
          item.employee === employeeId ? { ...item, status: newStatus } : item
        );
      });
    }
  };

  // Handle status change for student attendance
  const handleStudentStatusChange = async (studentId: number, newStatus: string) => {
    const token = getAuthToken();
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      console.log(`Updating student attendance ${studentId} to status: ${newStatus}`);
      
      // Find the attendance record for this student
      const attendanceRecord = studentAttendance.find(item => item.student === studentId);
      
      let response;
      
      if (attendanceRecord?.id) {
        // This is an existing record, update it
        console.log(`Updating existing record for student ${studentId}`);
        response = await axios.patch(
          `${API_BASE_URL}/api/student-attendance/${attendanceRecord.id}/`,
          { status: newStatus },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Update student attendance response:', response.data);
      } else {
        // This is a new record, create it
        console.log(`Creating new record for student ${studentId}`);
        const newRecord = {
          student: studentId,
          date: selectedDate,
          status: newStatus,
          // Include any other required fields from the student data
          remarks: null
        };
        
        response = await axios.post(
          `${API_BASE_URL}/api/student-attendance/`,
          newRecord,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        console.log('Create student attendance response:', response.data);
      }
      
      // Update local state with the response data
      const updatedRecord = response?.data;
      
      if (updatedRecord) {
        setStudentAttendance(prev => {
          if (!Array.isArray(prev)) {
            console.warn('studentAttendance is not an array when updating');
            return [];
          }
          
          // Find the index of the record to update
          const recordIndex = prev.findIndex(item => item.student === studentId);
          
          // Get the student data to ensure we maintain all required display fields
          const studentData = students.find(stu => stu.id === studentId);
          
          if (recordIndex === -1) {
            // Record not found, add it to the array with student data
            return [...prev, {
              ...updatedRecord,
              student_name: studentData?.student_name || `Student #${studentId}`,
              student_id: studentData?.student_id || `ID-${studentId}`,
              branch_name: studentData?.branch_name || 'Unknown'
            }];
          } else {
            // Update the existing record
            const updatedAttendance = [...prev];
            updatedAttendance[recordIndex] = {
              ...updatedAttendance[recordIndex],
              ...updatedRecord,
              status: newStatus
            };
            return updatedAttendance;
          }
        });
      } else {
        // If we don't have a response, just update the status in the local state
        setStudentAttendance(prev => {
          if (!Array.isArray(prev)) {
            console.warn('studentAttendance is not an array when updating');
            return [];
          }
          return prev.map(item => 
            item.student === studentId ? { ...item, status: newStatus } : item
          );
        });
      }
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
    } catch (err: any) {
      console.error('Error updating student attendance:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      setError('Failed to update student attendance status');
      // If unauthorized (401), redirect to login
      if (err.response?.status === 401) {
        navigate('/login');
      }
      
      // Update local state anyway to provide immediate feedback
      setStudentAttendance(prev => {
        if (!Array.isArray(prev)) {
          return [];
        }
        return prev.map(item => 
          item.student === studentId ? { ...item, status: newStatus } : item
        );
      });
    }
  };

  return (
    <Layout showHeader={false}>
      <div className="container mx-auto px-4 py-8 mt-6">
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Management</h1>
          
          {/* Date Selector */}
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full md:w-64"
              disabled={employeeLoading || studentLoading}
            />
          </div>
          
          {updateSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Attendance updated successfully
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Tabs for different attendance types */}
          <Tabs selectedIndex={tabIndex} onSelect={(index: number) => setTabIndex(index)} className="mt-6">
            <TabList className="flex border-b mb-4">
              <Tab className="px-4 py-2 cursor-pointer focus:outline-none border-b-2 border-transparent transition-colors hover:text-blue-600 hover:border-blue-600 aria-selected:border-blue-600 aria-selected:text-blue-600 font-medium">
                Employee Attendance
              </Tab>
              <Tab className="px-4 py-2 cursor-pointer focus:outline-none border-b-2 border-transparent transition-colors hover:text-blue-600 hover:border-blue-600 aria-selected:border-blue-600 aria-selected:text-blue-600 font-medium">
                Student Attendance
              </Tab>
            </TabList>

            {/* Employee Attendance Summary */}
            <div className="mb-6 grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Employee Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-700">
                      {employeeAttendance.filter(e => e.status === 'Present').length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-sm text-red-600">Absent</p>
                    <p className="text-2xl font-bold text-red-700">
                      {employeeAttendance.filter(e => e.status === 'Absent').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">Student Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-3 rounded">
                    <p className="text-sm text-green-600">Present</p>
                    <p className="text-2xl font-bold text-green-700">
                      {studentAttendance.filter(s => s.status === 'Present').length}
                    </p>
                  </div>
                  <div className="bg-red-50 p-3 rounded">
                    <p className="text-sm text-red-600">Absent</p>
                    <p className="text-2xl font-bold text-red-700">
                      {studentAttendance.filter(s => s.status === 'Absent').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Attendance Tab */}
            <TabPanel>
              {employeeLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">ID</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Role</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Branch</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!employeeAttendance || employeeAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                            No employees found
                          </td>
                        </tr>
                      ) : (
                        Array.isArray(employeeAttendance) && employeeAttendance.map((record) => (
                          <tr key={`emp-${record.employee}`} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">{record.employee_name}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{record.employee_id}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{record.employee_role}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{record.branch_name}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                record.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <select
                                value={record.status}
                                onChange={(e) => handleEmployeeStatusChange(record.employee, e.target.value)}
                                className="border border-gray-300 rounded p-1 text-sm"
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
              )}
            </TabPanel>

            {/* Student Attendance Tab */}
            <TabPanel>
              {studentLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Name</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">ID</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Branch</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-gray-700 border-b">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!studentAttendance || studentAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        Array.isArray(studentAttendance) && studentAttendance.map((record) => (
                          <tr key={`stud-${record.student}`} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-700">{record.student_name}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{record.student_id}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{record.branch_name}</td>
                            <td className="py-3 px-4 text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                record.status === 'Present' ? 'bg-green-100 text-green-800' :
                                record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                                record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                                record.status === 'Half Day' ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <select
                                value={record.status}
                                onChange={(e) => handleStudentStatusChange(record.student, e.target.value)}
                                className="border border-gray-300 rounded p-1 text-sm"
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
              )}
            </TabPanel>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AttendancePage; 