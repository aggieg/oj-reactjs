import { RemoteProxy, RemoteSession } from '../remote/remote'

import { TreeChangeListener } from '../main/ojTreeModel';

import { NodeInfo } from '../main/ojDao';
import { Clipboard, NavigatorClipboard } from '../clipboard';


/**
 * The context in which an ActionFactory may or may not create an Action.
 */
export type ActionContext = {

    parent: ActionContext | null;

    proxy: RemoteProxy;

    clipboard: Clipboard;
}

/**
 * Creates an Action or not given then ActionContext.
 */
export type ActionFactory = {

    createAction(actionContext: ActionContext): Promise<Action | null>;
}


/**
 * An Action is something that can be performed via a menu
 */
export interface Action {

    name: string;

    isEnabled: boolean;

    perform: () => void;

}

export class ActionFactories {

    constructor(private readonly actionFactories: ActionFactory[]) { }

    async actionsFor(context: ActionContext): Promise<Action[]> {

        const actionPromises: Promise<Action | null>[] = this.actionFactories.map(f => f.createAction(context));

        const actions = await Promise.all(actionPromises);

        return actions.filter(action => action != null)
            .map(action_1 => action_1 as Action);
    }
}

export function contextSearch<T>(context: ActionContext | null, cntor: ({ new(...args: any[]): T })): T | null {
    if (context == null) {
        return null;
    }
    if (context.proxy.isA(cntor)) {
        return context.proxy.as(cntor);
    }
    return contextSearch(context.parent, cntor);
}



/**
 * Old way
 */
export interface AvailableActions {

    actionsFor(nodeId: number): Promise<Action[]>;
}



/**
 * Used by the old tree
 */
export class ContextManager implements TreeChangeListener, AvailableActions {

    contexts: Map<number, Promise<ActionContext>> = new Map();

    constructor(readonly remoteSession: RemoteSession,
        readonly actionFactories: ActionFactory[]) {

    }

    treeInitialised(event: { rootNode: NodeInfo; }): void {

        const nodeId = event.rootNode.nodeId;

        const contextPromise: Promise<ActionContext> =
            this.remoteSession.getOrCreate(nodeId)
                .then(proxy => ({
                    proxy: proxy,
                    parent: null,
                    clipboard: new NavigatorClipboard()
                }));

        this.contexts.set(nodeId, contextPromise);
    }

    private createNodes(parentId: number, nodeIds: number[]): void {

        const parentContextPromise: Promise<ActionContext> | undefined = this.contexts.get(parentId)

        if (parentContextPromise) {

            nodeIds.map(nodeId => {
                const contextPromise: Promise<ActionContext> =
                    parentContextPromise
                        .then(parent =>
                            this.remoteSession.getOrCreate(nodeId)
                                .then(proxy => ({
                                    proxy: proxy,
                                    parent: parent,
                                    clipboard: parent.clipboard
                                }))
                        )
                this.contexts.set(nodeId, contextPromise);
            });
        }
    }

    nodeInserted(event: { parentId: number; index: number; node: NodeInfo; }): void {

        this.createNodes(event.parentId, [event.node.nodeId]);
    }

    nodeRemoved(event: { nodeId: number; }): void {

        this.contexts.delete(event.nodeId);
    }

    nodeExpanded(event: { parentId: number; nodeList: NodeInfo[]; }): void {

        const nodeIds: number[] = event.nodeList.map(nl => nl.nodeId);

        this.createNodes(event.parentId, nodeIds);
    }

    nodeCollapsed(event: { parentId: number; }): void {

    }

    nodeUpdated(event: { node: NodeInfo; }): void {

    }

    async actionsFor(nodeId: number): Promise<Action[]> {

        const contextPromise: Promise<ActionContext> | undefined = this.contexts.get(nodeId)

        const self = this;

        if (contextPromise) {
            const context = await contextPromise;

            return new ActionFactories(this.actionFactories)
                .actionsFor(context);
        }
        else {
            return Promise.resolve([]);
        }
    }
}

