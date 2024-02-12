#!/usr/bin/env node

import { program } from 'commander';
import pkg from '../package.json';
import { readFile } from 'fs/promises';
import { Interpreter, Parser, createGlobalEnv } from '@kin-lang/core';
import * as readline from 'readline/promises';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

program
  .name('kin')
  .description(
    'Kin Programming Language: write computer programs in Kinyarwanda. @cli',
  )
  .usage('command [arguments]')
  .version(
    `\x1b[1mv${pkg.version}\x1b[0m`,
    '-v, --version',
    "Output kin's current version.",
  )
  .helpOption('-h, --help', 'Output usage of Kin.');

program
  .command('repl')
  .description("Enter Kin's Repl")
  .action(async () => {
    const parser = new Parser();
    const env = createGlobalEnv(process.cwd());

    console.log(`Repl ${pkg.version} (Kin)`);

    while (true) {
      const input = await rl.question('> ');

      // check for no user input or exit keyword.
      if (!input || input.includes('.exit')) {
        process.exit(1);
      }

      const program = parser.produceAST(input);

      Interpreter.evaluate(program, env);
    }
  });

program
  .command('run <file_location>')
  .description('Runs a given file.')
  .action(async (file_location) => {
    try {
      const source_codes = await readFile(file_location, 'utf-8');
      const parser = new Parser();
      const ast = parser.produceAST(source_codes); // Produce AST for Kin
      const env = createGlobalEnv(file_location); // create global environment for Kin
      Interpreter.evaluate(ast, env); // Evaluate the program
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.error(`Kin Error: Can't resolve file at '${file_location}'`);
      } else {
        console.error(`Error reading file: ${(error as Error).message}`);
      }
    }
  });

program.parse();
