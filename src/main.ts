
import * as cli from './cli/by-command';
import * as yargs from 'yargs';
const argv = yargs
  .version()
  .usage('Usage: csv-scanner <command> [options]')
  .command(['enc [filePath]'], 'Detect Encoding ')
  .command(['server [xmlConfigFile]'], 'Detect Encoding ')

  .argv;
const [commandName] = argv._;
const commandHandler = cli[commandName || 'server'];
if (!commandHandler) throw new Error(`Command:${commandName} not found in csv-scanner`);
commandHandler(argv);

