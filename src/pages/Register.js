import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Alert,
  CircularProgress,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import WcIcon from "@mui/icons-material/Wc";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .matches(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/, "Password must contain at least one number")
    .matches(/^(?=.*[@$!%*?&])/, "Password must contain at least one special character (@, $, !, %, *, ?, &)")
    .max(128, "Password cannot exceed 128 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number starting with 6-9")
    .required("Phone number is required"),
  dob: Yup.date()
    .max(new Date(), "Date of birth cannot be in the future")
    .required("Date of birth is required"),
  gender: Yup.string()
    .oneOf(["male", "female", "other"], "Select a valid gender")
    .required("Gender is required"),
});

const Register = ({ mode }) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation function with toaster messages
  const validatePasswordRequirements = (password) => {
    const requirements = [
      {
        test: password.length >= 8,
        message: "Password must be at least 8 characters long"
      },
      {
        test: /[a-z]/.test(password),
        message: "Password must contain at least one lowercase letter"
      },
      {
        test: /[A-Z]/.test(password),
        message: "Password must contain at least one uppercase letter"
      },
      {
        test: /\d/.test(password),
        message: "Password must contain at least one number"
      },
      {
        test: /[@$!%*?&]/.test(password),
        message: "Password must contain at least one special character (@, $, !, %, *, ?, &)"
      }
    ];

    const failedRequirements = requirements.filter(req => !req.test);
    
    if (failedRequirements.length > 0) {
      // Show all failed requirements in a single toast
      const messages = failedRequirements.map(req => `• ${req.message}`).join('\n');
      toast.error(`Password Requirements:\n${messages}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          whiteSpace: 'pre-line'
        }
      });
      return false;
    }
    return true;
  };

  // Handle password change with real-time validation
  const handlePasswordChange = (e) => {
    formik.handleChange(e);
    const password = e.target.value;
    
    // Only validate if user has typed at least 3 characters to avoid spam
    if (password.length >= 3 && password.length < 8) {
      setTimeout(() => {
        if (password === formik.values.password) { // Check if password hasn't changed
          validatePasswordRequirements(password);
        }
      }, 1000); // Debounce for 1 second
    }
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      dob: "",
      gender: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");
        
        // Validate password requirements before submission
        if (!validatePasswordRequirements(values.password)) {
          setLoading(false);
          return;
        }

        // Check if passwords match
        if (values.password !== values.confirmPassword) {
          toast.error("Passwords do not match!", {
            position: "top-right",
            autoClose: 3000,
          });
          setLoading(false);
          return;
        }

        const response = await register({
          name: values.name,
          email: values.email,
          password: values.password,
          phone: values.phone,
          dob: values.dob,
          gender: values.gender
        });
        toast.success(response.message || "Registration successful! Redirecting to login...");
        setSuccess(response.message || "Registration successful! Redirecting to login...");
        // Navigate to login page after successful registration
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to register");
        setError(err.response?.data?.message || "Failed to register");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container
      maxWidth="sm"
      sx={{
        py: { xs: 4, md: 8 },
        bgcolor: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <ToastContainer />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url(/Beaten/Artboard 3.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          py: 8,
        }}
      >
        <Paper
          sx={{
            p: 4,
            width: "100%",
            maxWidth: 450,
            borderRadius: 4,
            boxShadow: 24,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: "primary.main",
              mb: 2,
              letterSpacing: 2,
            }}
          >
            JOIN BEATEN
          </Typography>
          <Typography
            variant="body1"
            align="center"
            color="text.secondary"
            sx={{
              mb: 4,
              fontSize: "1.1rem",
            }}
          >
            Create your exclusive fashion account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Full Name"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              margin="normal"
              InputProps={{
                startAdornment: <PersonIcon sx={{ color: "action.active", mr: 1 }} />,
              }}
            />
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: "action.active", mr: 1 }} />,
              }}
            />
            <TextField
              fullWidth
              id="phone"
              name="phone"
              label="Phone Number"
              value={formik.values.phone}
              onChange={formik.handleChange}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              margin="normal"
              InputProps={{
                startAdornment: <PhoneIcon sx={{ color: "action.active", mr: 1 }} />,
              }}
            />
            <TextField
              fullWidth
              id="dob"
              name="dob"
              label="Date of Birth"
              type="date"
              value={formik.values.dob}
              onChange={formik.handleChange}
              error={formik.touched.dob && Boolean(formik.errors.dob)}
              helperText={formik.touched.dob && formik.errors.dob}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: <CalendarTodayIcon sx={{ color: "action.active", mr: 1 }} />,
              }}
            />
            <TextField
              select
              fullWidth
              id="gender"
              name="gender"
              label="Gender"
              value={formik.values.gender}
              onChange={formik.handleChange}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
              helperText={formik.touched.gender && formik.errors.gender}
              margin="normal"
              InputProps={{
                startAdornment: <WcIcon sx={{ color: "action.active", mr: 1 }} />,
              }}
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              type="password"
              value={formik.values.password}
              onChange={handlePasswordChange}
              onBlur={(e) => {
                formik.handleBlur(e);
                // Validate password on blur if there's a value
                if (e.target.value && e.target.value.length > 0) {
                  validatePasswordRequirements(e.target.value);
                }
              }}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={
                formik.touched.password && formik.errors.password ? 
                formik.errors.password : 
                "Password must contain: 8+ characters, uppercase, lowercase, number, special character"
              }
              margin="normal"
              InputProps={{
                startAdornment: <LockIcon sx={{ color: "action.active", mr: 1 }} />,
              }}
            />
            <TextField
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              margin="normal"
              InputProps={{
                startAdornment: <LockIcon sx={{ color: "action.active", mr: 1 }} />,
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                backgroundColor: "#1a1a1a",
                color: "white",
                borderRadius: 10,
                fontWeight: 700,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#2d2d2d",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {loading ? <CircularProgress size={24} /> : "Create Account"}
            </Button>
          </form>

          <Box sx={{ textAlign: "center", mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link component={RouterLink} to="/login">
                Login here
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
