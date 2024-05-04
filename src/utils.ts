export const throttle = <ArgType>(
	instance: unknown,
	func: (args: ArgType) => unknown,
	delay: number = 2000
) => {
	let flag: NodeJS.Timeout | null = null;
	const _this = instance;

	return (args: ArgType) => {
		if (flag === null) {
			func.call(_this, args);
			flag = setTimeout(() => {
				flag = null;
			}, delay);
		}
	};
};
