export default {
	extensions: ["ts", "tsx"],
	files: ["./test/**/*.test.ts", "./test/**/*.test.tsx"],
	require: ["./ava.register"],
	verbose: true,
};
