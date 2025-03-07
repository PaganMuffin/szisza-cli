#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
// import meow from 'meow';
import App from './app.js';
import initYogaAsm from 'yoga-wasm-web/asm';
//@ts-ignore
const Yoga = initYogaAsm();
// const cli = meow(
// 	`
// 	Usage
// 	  $ szisza-dl

// 	Options
// 		--name  Your name

// 	Examples
// 	  $ szisza-dl --name=Jane
// 	  Hello, Jane
// `,
// 	{
// 		importMeta: import.meta,
// 		flags: {
// 			name: {
// 				type: 'string',
// 			},
// 		},
// 	},
// );

render(<App />);
