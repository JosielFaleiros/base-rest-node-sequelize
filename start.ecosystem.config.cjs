module.exports = {
  apps : [{
    name: 'start',
    // node_args: "--inspect=3500",

    script: 'dist/app.js',
    // script: 'yarn',
    // args: ' start',

    watch: '.',
    time: true,
    // exec_mode: 'cluster_mode',0
    // node_args: '--expose-gc',
    env: {'db_force': 'false', 'PORT': 3000},
    instances: 'max'
    // instances: 3
  }]
}
