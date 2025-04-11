import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/slices/Authslice";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    await dispatch(loginUser(data)).unwrap(); // Ensures proper error handling
    navigate("/");
  };

  return (
    <div className="flex justify-center items-center p-6 dark:bg-black dark:text-white text-black bg-white rounded-lg">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="dark:bg-gray-800 bg-gray-200 p-6 border border-gray-500 rounded-lg shadow-xl w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Email Field */}
        <div className="mb-3">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-1 rounded-lg dark:bg-black bg-white"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-3">
          <label className="block font-medium">Password</label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="w-full p-1 rounded-lg dark:bg-black bg-white"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          {/* Forgot Password Link */}
          <div className="text-right mt-1">
            <Link
              to="/forget" 
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-lg text-lg font-semibold shadow-md hover:opacity-90 transition"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
