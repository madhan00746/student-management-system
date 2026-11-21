
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import "./App.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

function App() {
    const [token, setToken] = useState(
        localStorage.getItem("token") || ""
    );

    const [admin, setAdmin] = useState(
        JSON.parse(localStorage.getItem("admin") || "null")
    );

    const [page, setPage] = useState("Dashboard");
    const [students, setStudents] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [marks, setMarks] = useState([]);
    const [stats, setStats] = useState({});
    const [search, setSearch] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const [login, setLogin] = useState({
        email: "admin@gmail.com",
        password: ""
    });

    const emptyStudent = {
        name: "",
        rollNo: "",
        email: "",
        phone: "",
        department: "",
        year: "",
        section: "A",
        address: ""
    };

    const [studentForm, setStudentForm] = useState(emptyStudent);

    const [attendanceForm, setAttendanceForm] = useState({
        studentId: "",
        date: new Date().toLocaleDateString("en-CA"),
        status: "Present"
    });

    const [markForm, setMarkForm] = useState({
        studentId: "",
        subject: "",
        semester: "Semester 1",
        internalMarks: "",
        externalMarks: ""
    });

    const [departmentForm, setDepartmentForm] = useState({
        name: "",
        code: ""
    });

    const http = axios.create({
        baseURL: API,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    // Load all application data
    const loadData = async () => {
        try {
            const [s, d, a, m, dashboard] = await Promise.all([
                http.get("/students"),
                http.get("/departments"),
                http.get("/attendance"),
                http.get("/marks"),
                http.get("/dashboard")
            ]);

            setStudents(s.data);
            setDepartments(d.data);
            setAttendance(a.data);
            setMarks(m.data);
            setStats(dashboard.data);

        } catch (error) {
            if (error.response?.status === 401) {
                logout();
            } else {
                setMessage("Unable to load application data");
            }
        }
    };

    useEffect(() => {
        if (token) {
            loadData();
        }
    }, [token]);

    // Admin login
    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${API}/auth/login`,
                login
            );

            const { token, admin } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("admin", JSON.stringify(admin));

            setToken(token);
            setAdmin(admin);
            setMessage("");

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Login failed"
            );
        }
    };

    // Logout
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("admin");

        setToken("");
        setAdmin(null);
        setStudents([]);
        setDepartments([]);
        setAttendance([]);
        setMarks([]);
    };

    // Student input
    const handleStudentChange = (e) => {
        setStudentForm({
            ...studentForm,
            [e.target.name]: e.target.value
        });
    };

    // Add or update student
    const saveStudent = async (e) => {
        e.preventDefault();

        try {
            if (editingId) {
                await http.put(`/students/${editingId}`, studentForm);
                setMessage("Student updated successfully");
            } else {
                await http.post("/students", studentForm);
                setMessage("Student added successfully");
            }

            setStudentForm(emptyStudent);
            setEditingId(null);
            await loadData();

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to save student"
            );
        }
    };

    // Edit student
    const editStudent = (student) => {
        setStudentForm({
            name: student.name,
            rollNo: student.rollNo,
            email: student.email,
            phone: student.phone,
            department: student.department,
            year: student.year,
            section: student.section || "A",
            address: student.address || ""
        });

        setEditingId(student._id);
        window.scrollTo(0, 0);
    };

    // Delete student
    const deleteStudent = async (id) => {
        if (!window.confirm("Delete this student?")) return;

        try {
            await http.delete(`/students/${id}`);
            setMessage("Student deleted successfully");
            await loadData();
        } catch (error) {
            setMessage("Unable to delete student");
        }
    };

    // Save attendance
    const saveAttendance = async (e) => {
        e.preventDefault();

        try {
            await http.post("/attendance", attendanceForm);
            setMessage("Attendance saved successfully");
            await loadData();
        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to save attendance"
            );
        }
    };

    // Save marks
    const saveMarks = async (e) => {
        e.preventDefault();

        try {
            await http.post("/marks", {
                ...markForm,
                internalMarks: Number(markForm.internalMarks),
                externalMarks: Number(markForm.externalMarks)
            });

            setMessage("Academic marks saved successfully");
            setMarkForm({
                studentId: "",
                subject: "",
                semester: "Semester 1",
                internalMarks: "",
                externalMarks: ""
            });

            await loadData();

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to save marks"
            );
        }
    };

    // Save department
    const saveDepartment = async (e) => {
        e.preventDefault();

        try {
            await http.post("/departments", departmentForm);
            setDepartmentForm({ name: "", code: "" });
            setMessage("Department added successfully");
            await loadData();

        } catch (error) {
            setMessage(
                error.response?.data?.message || "Unable to add department"
            );
        }
    };

    // Search students
    const filteredStudents = students.filter(student =>
        [
            student.name,
            student.rollNo,
            student.department,
            student.email
        ].some(value =>
            value?.toLowerCase().includes(search.toLowerCase())
        )
    );

    // Login page
    if (!token) {
        return (
            <div className="login-page">
                <form className="login-card" onSubmit={handleLogin}>
                    <div className="login-logo">S</div>
                    <h1>Student Management</h1>
                    <p>Admin Portal Login</p>

                    <label>Email Address</label>
                    <input
                        type="email"
                        value={login.email}
                        onChange={e => setLogin({
                            ...login,
                            email: e.target.value
                        })}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={login.password}
                        onChange={e => setLogin({
                            ...login,
                            password: e.target.value
                        })}
                        required
                    />

                    {message && <p className="message">{message}</p>}

                    <button className="primary-btn" type="submit">
                        Login to Dashboard
                    </button>

                    <small>Student Management System © 2026</small>
                </form>
            </div>
        );
    }

    return (
        <div className="app-layout">

            <Sidebar
                page={page}
                setPage={setPage}
                logout={logout}
            />

            <main className="main-content">

                <header className="topbar">
                    <div>
                        <h2>{page}</h2>
                        <p>Manage your college student information</p>
                    </div>

                    <div className="admin-info">
                        <span className="avatar">A</span>
                        <div>
                            <strong>{admin?.name || "Admin"}</strong>
                            <small>Administrator</small>
                        </div>
                    </div>
                </header>

                {message && (
                    <div className="message-bar">
                        {message}
                        <button onClick={() => setMessage("")}>×</button>
                    </div>
                )}

                {/* DASHBOARD */}
                {page === "Dashboard" && (
                    <>
                        <div className="welcome">
                            <h2>Welcome back, {admin?.name}!</h2>
                            <p>Here's your student management overview.</p>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card blue">
                                <span>Total Students</span>
                                <h1>{stats.totalStudents || 0}</h1>
                                <small>Registered students</small>
                            </div>

                            <div className="stat-card green">
                                <span>Departments</span>
                                <h1>{stats.totalDepartments || 0}</h1>
                                <small>Available departments</small>
                            </div>

                            <div className="stat-card purple">
                                <span>Present Today</span>
                                <h1>{stats.present || 0}</h1>
                                <small>Students present</small>
                            </div>

                            <div className="stat-card orange">
                                <span>Absent Today</span>
                                <h1>{stats.absent || 0}</h1>
                                <small>Students absent</small>
                            </div>
                        </div>

                        <section className="panel">
                            <h3>Recent Student Registrations</h3>
                            <StudentTable
                                students={students.slice(0, 5)}
                                editStudent={editStudent}
                                deleteStudent={deleteStudent}
                            />
                        </section>

                        <section className="panel">
                            <h3>Academic Overview</h3>
                            <p>Total academic records: {stats.totalMarks || 0}</p>
                        </section>
                    </>
                )}

                {/* STUDENTS */}
                {page === "Students" && (
                    <>
                        <section className="panel">
                            <h3>{editingId ? "Edit Student" : "Register New Student"}</h3>

                            <form className="form-grid" onSubmit={saveStudent}>
                                <input name="name" placeholder="Full Name"
                                    value={studentForm.name}
                                    onChange={handleStudentChange} required />

                                <input name="rollNo" placeholder="Roll Number"
                                    value={studentForm.rollNo}
                                    onChange={handleStudentChange} required />

                                <input name="email" type="email" placeholder="Email"
                                    value={studentForm.email}
                                    onChange={handleStudentChange} required />

                                <input name="phone" placeholder="Phone Number"
                                    value={studentForm.phone}
                                    onChange={handleStudentChange} required />

                                <select name="department"
                                    value={studentForm.department}
                                    onChange={handleStudentChange} required>
                                    <option value="">Select Department</option>
                                    {departments.map(d => (
                                        <option key={d._id} value={d.name}>{d.name}</option>
                                    ))}
                                </select>

                                <select name="year" value={studentForm.year}
                                    onChange={handleStudentChange} required>
                                    <option value="">Select Year</option>
                                    {["1st Year", "2nd Year", "3rd Year", "4th Year"].map(y =>
                                        <option key={y}>{y}</option>
                                    )}
                                </select>

                                <select name="section" value={studentForm.section}
                                    onChange={handleStudentChange}>
                                    <option value="A">Section A</option>
                                    <option value="B">Section B</option>
                                    <option value="C">Section C</option>
                                </select>

                                <input name="address" placeholder="Address"
                                    value={studentForm.address}
                                    onChange={handleStudentChange} />

                                <div className="form-actions">
                                    <button className="primary-btn">
                                        {editingId ? "Update Student" : "Add Student"}
                                    </button>
                                    <button type="button" className="secondary-btn"
                                        onClick={() => {
                                            setStudentForm(emptyStudent);
                                            setEditingId(null);
                                        }}>
                                        Clear
                                    </button>
                                </div>
                            </form>
                        </section>

                        <section className="panel">
                            <div className="panel-heading">
                                <h3>Student Records ({filteredStudents.length})</h3>
                                <input className="search-input"
                                    placeholder="Search students..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)} />
                            </div>

                            <StudentTable
                                students={filteredStudents}
                                editStudent={editStudent}
                                deleteStudent={deleteStudent}
                            />
                        </section>
                    </>
                )}

                {/* ATTENDANCE */}
                {page === "Attendance" && (
                    <>
                        <section className="panel">
                            <h3>Mark Student Attendance</h3>

                            <form className="form-grid" onSubmit={saveAttendance}>
                                <select required
                                    value={attendanceForm.studentId}
                                    onChange={e => setAttendanceForm({
                                        ...attendanceForm,
                                        studentId: e.target.value
                                    })}>
                                    <option value="">Select Student</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.rollNo} - {s.name}
                                        </option>
                                    ))}
                                </select>

                                <input type="date" required
                                    value={attendanceForm.date}
                                    onChange={e => setAttendanceForm({
                                        ...attendanceForm,
                                        date: e.target.value
                                    })} />

                                <select
                                    value={attendanceForm.status}
                                    onChange={e => setAttendanceForm({
                                        ...attendanceForm,
                                        status: e.target.value
                                    })}>
                                    <option>Present</option>
                                    <option>Absent</option>
                                    <option>Late</option>
                                </select>

                                <button className="primary-btn">Save Attendance</button>
                            </form>
                        </section>

                        <section className="panel">
                            <h3>Attendance Records</h3>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Roll Number</th>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance.map(a => (
                                            <tr key={a._id}>
                                                <td>{a.studentId?.name || "Unknown"}</td>
                                                <td>{a.studentId?.rollNo || "-"}</td>
                                                <td>{a.date}</td>
                                                <td><span className={`status ${a.status.toLowerCase()}`}>{a.status}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {/* MARKS */}
                {page === "Academic Records" && (
                    <>
                        <section className="panel">
                            <h3>Enter Academic Marks</h3>

                            <form className="form-grid" onSubmit={saveMarks}>
                                <select required
                                    value={markForm.studentId}
                                    onChange={e => setMarkForm({
                                        ...markForm,
                                        studentId: e.target.value
                                    })}>
                                    <option value="">Select Student</option>
                                    {students.map(s => (
                                        <option key={s._id} value={s._id}>
                                            {s.rollNo} - {s.name}
                                        </option>
                                    ))}
                                </select>

                                <input placeholder="Subject Name" required
                                    value={markForm.subject}
                                    onChange={e => setMarkForm({
                                        ...markForm,
                                        subject: e.target.value
                                    })} />

                                <select value={markForm.semester}
                                    onChange={e => setMarkForm({
                                        ...markForm,
                                        semester: e.target.value
                                    })}>
                                    {[1,2,3,4,5,6,7,8].map(n => (
                                        <option key={n}>Semester {n}</option>
                                    ))}
                                </select>

                                <input type="number" placeholder="Internal Marks (0-100)"
                                    min="0" max="100" required
                                    value={markForm.internalMarks}
                                    onChange={e => setMarkForm({
                                        ...markForm,
                                        internalMarks: e.target.value
                                    })} />

                                <input type="number" placeholder="External Marks (0-100)"
                                    min="0" max="100" required
                                    value={markForm.externalMarks}
                                    onChange={e => setMarkForm({
                                        ...markForm,
                                        externalMarks: e.target.value
                                    })} />

                                <button className="primary-btn">Save Marks</button>
                            </form>
                        </section>

                        <section className="panel">
                            <h3>Academic Records</h3>
                            <div className="table-wrap">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Roll Number</th>
                                            <th>Subject</th>
                                            <th>Semester</th>
                                            <th>Internal</th>
                                            <th>External</th>
                                            <th>Total</th>
                                            <th>Result</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {marks.map(m => {
                                            const total = m.internalMarks + m.externalMarks;
                                            return (
                                                <tr key={m._id}>
                                                    <td>{m.studentId?.name || "Unknown"}</td>
                                                    <td>{m.studentId?.rollNo || "-"}</td>
                                                    <td>{m.subject}</td>
                                                    <td>{m.semester}</td>
                                                    <td>{m.internalMarks}</td>
                                                    <td>{m.externalMarks}</td>
                                                    <td>{total}/200</td>
                                                    <td>
                                                        <span className={`status ${total >= 100 ? "present" : "absent"}`}>
                                                            {total >= 100 ? "Pass" : "Fail"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}

                {/* DEPARTMENTS */}
                {page === "Departments" && (
                    <>
                        <section className="panel">
                            <h3>Add Department</h3>

                            <form className="form-grid" onSubmit={saveDepartment}>
                                <input placeholder="Department Name"
                                    required value={departmentForm.name}
                                    onChange={e => setDepartmentForm({
                                        ...departmentForm,
                                        name: e.target.value
                                    })} />

                                <input placeholder="Department Code"
                                    required value={departmentForm.code}
                                    onChange={e => setDepartmentForm({
                                        ...departmentForm,
                                        code: e.target.value.toUpperCase()
                                    })} />

                                <button className="primary-btn">Add Department</button>
                            </form>
                        </section>

                        <section className="panel">
                            <h3>Department List</h3>
                            <div className="department-grid">
                                {departments.map(d => (
                                    <div className="department-card" key={d._id}>
                                        <div className="department-icon">▥</div>
                                        <h3>{d.name}</h3>
                                        <p>{d.code}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}

            </main>
        </div>
    );
}

// Reusable student table
function StudentTable({ students, editStudent, deleteStudent }) {
    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Student</th>
                        <th>Roll Number</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {students.length ? students.map(student => (
                        <tr key={student._id}>
                            <td>{student.name}</td>
                            <td>{student.rollNo}</td>
                            <td>{student.department}</td>
                            <td>{student.year}</td>
                            <td>{student.email}</td>
                            <td>
                                <button className="edit-btn"
                                    onClick={() => editStudent(student)}>
                                    Edit
                                </button>

                                <button className="delete-btn"
                                    onClick={() => deleteStudent(student._id)}>
                                    Delete
                                </button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="6" className="empty">
                                No student records found
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default App;
