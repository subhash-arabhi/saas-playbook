// Opens plans/*.md in an editable plan view inside VS Code / Cursor.
// The UI and all plan logic come from plan-core.mjs (a copy of .agents/tools/plan.mjs made by install.sh).
const vscode = require('vscode')
const path = require('path')
const crypto = require('crypto')
const { pathToFileURL } = require('url')

let corePromise
const core = () => (corePromise ||= import(pathToFileURL(path.join(__dirname, 'plan-core.mjs')).href))

class PlanEditorProvider {
  async resolveCustomTextEditor(document, panel) {
    const { renderPage, stateOf, applyOp } = await core()
    const nonce = crypto.randomBytes(16).toString('hex')
    panel.webview.options = { enableScripts: true }
    panel.webview.html = renderPage('editor', { nonce, cspSource: panel.webview.cspSource })

    const send = (notice) => panel.webview.postMessage({ type: 'state', state: stateOf(document.getText()), notice })
    const changeSub = vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.toString() === document.uri.toString()) send()
    })
    panel.onDidDispose(() => changeSub.dispose())

    panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'ready') return send()
      if (msg.type === 'openText') return vscode.commands.executeCommand('vscode.openWith', document.uri, 'default')
      if (msg.type !== 'op') return
      const r = applyOp(document.getText(), msg.op, msg.version)
      if (r.conflict) return send('Not saved: the plan changed while you were editing. It has been reloaded; please re-apply your edit.')
      if (r.error) return send(`Not saved: ${r.error}`)
      const edit = new vscode.WorkspaceEdit()
      edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), r.text)
      await vscode.workspace.applyEdit(edit)
      await document.save()
    })
  }
}

exports.activate = (context) => {
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider('saasPlaybook.plan', new PlanEditorProvider(), {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.commands.registerCommand('saasPlaybook.openPlanView', (uri) => {
      const target = uri || vscode.window.activeTextEditor?.document.uri
      if (target) vscode.commands.executeCommand('vscode.openWith', target, 'saasPlaybook.plan')
    }),
  )
}
exports.deactivate = () => {}
