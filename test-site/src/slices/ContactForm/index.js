import { Bounded } from "../../components/Bounded";

const Field = ({ label, children }) => {
	return (
		<label>
			<span className="text-sm text-slate-500">{label}</span>
			{children}
		</label>
	);
};

const InputField = ({
	label,
	name,
	type = "text",
	placeholder,
	required = true,
}) => {
	return (
		<Field label={label}>
			<input
				name={name}
				type={type}
				required={required}
				placeholder={placeholder}
				className="w-full rounded-none border-b border-slate-200 py-3 pr-7 pl-3 text-slate-800 placeholder-slate-400"
			/>
		</Field>
	);
};

const TextareaField = ({ label, name, placeholder, required = true }) => {
	return (
		<Field label={label}>
			<textarea
				name={name}
				required={required}
				placeholder={placeholder}
				className="h-40 w-full rounded-none border-b border-slate-200 py-3 pr-7 pl-3 text-slate-800 placeholder-slate-400"
			/>
		</Field>
	);
};

const ContactForm = () => {
	return (
		<Bounded as="section" size="small">
			<form
				action="/api/contact"
				method="post"
				className="grid grid-cols-1 gap-6"
			>
				<InputField label="Name" name="name" placeholder="Jane Doe" />
				<InputField
					label="Email Address"
					name="email"
					type="email"
					placeholder="jane.doe@example.com"
				/>
				<TextareaField
					label="Message"
					name="message"
					placeholder="Write your message here…"
				/>
				<button
					type="submit"
					className="ml-auto inline-flex items-center gap-2"
				>
					Send message{" "}
					<span aria-hidden={true} className="text-xl">
						&rarr;
					</span>
				</button>
			</form>
		</Bounded>
	);
};

export default ContactForm;
