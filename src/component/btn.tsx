import { Component, ComponentProps, createEffect } from "solid-js";
import { theme, setTheme } from "../store";

export const Button = (params:ComponentProps<'button'>) => {
	const storageKey = "theme-preference";
	const getColorPreference = (): "dark" | "light" | string => {
		let colorPreference = localStorage.getItem(storageKey);
		if (!colorPreference) colorPreference = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
		return colorPreference;
	};
	setTheme(getColorPreference());
	const reflectPreference = () => {
		if (
			localStorage.getItem(storageKey) === "dark" ||
			(!(storageKey in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
		)
			document.documentElement.classList.add("dark");
		else document.documentElement.classList.remove("dark");
		document.querySelector("#theme-toggle")?.setAttribute("aria-label", theme());
	};
	createEffect(() => {
		localStorage.setItem(storageKey, theme());
		reflectPreference();
	});
	const changeTheme = () => {
		setTheme((c) => (c === "light" ? "dark" : "light"));
	};
	reflectPreference();
	window.onload = () => {
		reflectPreference();
	};
	// sync with system changes
	window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", ({ matches: isDark }) => {
		setTheme(isDark ? "dark" : "light");
		localStorage.setItem(storageKey, theme());
		reflectPreference();
	});
	return (
		<button
			onClick={() => {
				params?.onClick();
				changeTheme();
			}}
			class="theme-toggle"
			id="theme-toggle"
			title="Toggles light & dark"
			aria-label="auto"
			aria-live="polite"
			style={{
				"--icon-fill": "hsl(65deg 100% 50%)",
				"--icon-fill-hover": "hsl(89deg 100% 50%)",
				"--dark-icon-fill": "hsl(210deg 94% 31%)",
				"--dark-icon-fill-hover": "hsl(210deg 100% 50%)",
			}}>
			<svg class="sun-and-moon" aria-hidden="true" width="24" height="24" viewBox="0 0 24 24">
				<mask class="moon" id="moon-mask">
					<rect x="0" y="0" width="100%" height="100%" fill="white" />
					<circle cx="24" cy="10" r="6" fill="black" />
				</mask>
				<circle class="sun" cx="12" cy="12" r="6" mask="url(#moon-mask)" fill="currentColor" />
				<g class="sun-beams" stroke="currentColor">
					<line x1="12" y1="1" x2="12" y2="3" />
					<line x1="12" y1="21" x2="12" y2="23" />
					<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
					<line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
					<line x1="1" y1="12" x2="3" y2="12" />
					<line x1="21" y1="12" x2="23" y2="12" />
					<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
					<line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
				</g>
			</svg>
		</button>
	);
};
