import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/slices/Authslice";
import { useNavigate } from "react-router-dom";

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
    const result = await dispatch(loginUser(data));
    if (result.payload) {
      navigate("/"); // Redirect to homepage on success
    }
  };

  return (
    <div className="flex justify-center items-center text-black min-h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-black p-6 rounded-lg shadow-md w-96"
      >
        <h2 className="text-white text-2xl font-bold text-center mb-4">Login</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Email Field */}
        <div className="mb-3">
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
          {errors.email && <p className="text-red-500">{errors.email.message}</p>}
        </div>

        {/* Password Field */}
        <div className="mb-3">
          <label className="block font-medium">Password</label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="w-full p-2 border rounded focus:outline-none focus:border-blue-500"
          />
          {errors.password && <p className="text-red-500">{errors.password.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
