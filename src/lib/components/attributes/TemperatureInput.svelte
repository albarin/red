<script lang="ts">
	export let temperature: number | undefined = undefined;

	let input0: HTMLInputElement;
	let input1: HTMLInputElement;
	let input2: HTMLInputElement;
	let input3: HTMLInputElement;
	let inputs: HTMLInputElement[];

	let temperatures: string[] = temperature
		? temperature
				.toFixed(2)
				.toString()
				.split('.')
				.map((t: string) => t.split(''))
				.flat()
		: ['', '', '', ''];

	$: inputs = [input0, input1, input2, input3];

	$: {
		if (!temperatures.join('').length) {
			temperature = undefined;
		} else {
			const number = `${temperatures?.[0] || 0}${temperatures?.[1] || 0}`;
			const decimals = `${temperatures?.[2] || 0}${temperatures?.[3] || 0}`;

			temperature = Number(`${number}.${decimals}`);
		}
	}

	const onInput = (i: number) => () => {
		if (i === 3) {
			return;
		}

		if (!inputs[i].value.length) {
			return;
		}

		inputs[i + 1].focus();
		inputs[i + 1].select();
	};

	const selectInputText = (i: number) => () => inputs[i].select();

	const onKeypress = () => (e: KeyboardEvent) => {
		const isNumber = /^[0-9]$/i.test(e.key);
		if (!isNumber) {
			e.preventDefault();
		}
	};

	const onKeydown = (i: number) => (e: KeyboardEvent) => {
		if (e.key === 'Backspace' && !inputs[i].value.length) {
			inputs[i - 1].focus();
			inputs[i - 1].select();
		}
	};
</script>

<div class="text-secondary items-end flex justify-center space-x-1">
	<input
		maxlength="1"
		class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
		bind:this={inputs[0]}
		bind:value={temperatures[0]}
		on:input={onInput(0)}
		on:click={selectInputText(0)}
		on:keypress={onKeypress()}
	/>
	<input
		maxlength="1"
		class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
		bind:this={inputs[1]}
		bind:value={temperatures[1]}
		on:input={onInput(1)}
		on:click={selectInputText(1)}
		on:keypress={onKeypress()}
		on:keydown={onKeydown(1)}
	/>
	<span>.</span>
	<input
		maxlength="1"
		class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
		bind:this={inputs[2]}
		bind:value={temperatures[2]}
		on:input={onInput(2)}
		on:click={selectInputText(2)}
		on:keypress={onKeypress()}
		on:keydown={onKeydown(2)}
	/>
	<input
		class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
		maxlength="1"
		bind:this={inputs[3]}
		bind:value={temperatures[3]}
		on:input={onInput(3)}
		on:click={selectInputText(3)}
		on:keypress={onKeypress()}
		on:keydown={onKeydown(3)}
	/>
</div>
