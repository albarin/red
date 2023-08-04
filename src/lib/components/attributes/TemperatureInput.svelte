<script lang="ts">
	import type { H } from 'vitest/dist/types-2b1c412e';
	import AttributeBox from './AttributeBox.svelte';

	let input0: HTMLInputElement;
	let input1: HTMLInputElement;
	let input2: HTMLInputElement;
	let input3: HTMLInputElement;
	let inputs: HTMLInputElement[] = [input0, input1, input2, input3];

	let currentInput: number = 0;

	let temperatureError: string | undefined;

	const replaceInput = (i: number) => () => {
		if (!inputs[i].value.length) {
			return;
		}

		inputs[i].value = '';
	};

	const onInput = (i: number) => () => {
		if (i === 0) {
			const value = Number(inputs[i].value);
			if (value < 3 || value > 4) {
				inputs[i].value = '';
				return;
			}
		}

		// go to next input except for the last one
		if (i === 3) {
			return;
		}

		inputs[i + 1].focus();
		inputs[i + 1].select();
	};

	const selectInputText = (i: number) => () => {
		inputs[i].select();
	};

	const onKeypress = (i: number) => (e: KeyboardEvent) => {
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

<AttributeBox title="Temperature">
	<div class="text-secondary items-end flex justify-center space-x-1">
		<input
			bind:this={inputs[0]}
			class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
			on:beforeinput={replaceInput(0)}
			on:input={onInput(0)}
			on:click={selectInputText(0)}
			on:keypress={onKeypress(0)}
		/>
		<input
			bind:this={inputs[1]}
			class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
			on:beforeinput={replaceInput(1)}
			on:input={onInput(1)}
			on:click={selectInputText(1)}
			on:keypress={onKeypress(1)}
			on:keydown={onKeydown(1)}
		/>
		<span>.</span>
		<input
			bind:this={inputs[2]}
			class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
			on:beforeinput={replaceInput(2)}
			on:input={onInput(2)}
			on:click={selectInputText(2)}
			on:keypress={onKeypress(2)}
			on:keydown={onKeydown(2)}
		/>
		<input
			bind:this={inputs[3]}
			class="bg-accent border border-secondary w-11 h-14 rounded-lg text-center text-primary text-4xl"
			on:beforeinput={replaceInput(3)}
			on:input={onInput(3)}
			on:click={selectInputText(3)}
			on:keypress={onKeypress(3)}
			on:keydown={onKeydown(3)}
		/>
	</div>
</AttributeBox>

<!-- <span class="text-3xl text-secondary relative -left-3" class:text-error={temperatureError}>
  ºC
</span> -->
<!--
<div
class="bg-white rounded-xl py-5 px-5"
class:text-error={temperatureError}
class:focus:text-error={temperatureError}
>
<p class="text-primary text-xl">Temperature</p>
</div> -->
<!-- {#if temperatureError}
  <p class="text-sm text-error">{temperatureError}</p>
{/if} -->
