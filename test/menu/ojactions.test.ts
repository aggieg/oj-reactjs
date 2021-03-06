import { mock } from "jest-mock-extended";
import { Clipboard } from "../../src/clipboard";
import { ConfigurationOwner, DragPoint, Resettable, Runnable, Stoppable } from "../../src/remote/ojremotes";
import { RemoteProxy } from "../../src/remote/remote";
import { CopyActionFactory, CutActionFactory, DeleteActionFactory, HardResetActionFactory, PasteActionFactory, RunActionFactory, SoftResetActionFactory, StopActionFactory } from "../../src/menu/ojactions";
import { Action, ActionContext } from "../../src/menu/actions";
import { Latch } from "../testutil";

test("Runnable Runs", async () => {

    const runnable = mock<Runnable>();

    const proxy = mock<RemoteProxy>();
    
    proxy.isA.calledWith(Runnable).mockReturnValue(true);
    proxy.as.calledWith(Runnable).mockReturnValue(runnable);

    const actionContext: ActionContext = {
        parent: null,
        proxy: proxy,
        clipboard: mock<Clipboard>()
    };

    const actionFactory = new RunActionFactory();

    const action = await actionFactory.createAction(actionContext);

    expect(action).not.toBeNull();

    (action as Action).perform();

    expect(runnable.run).toBeCalled();
});

test("Soft Reset Resets", async () => {

    const resettable = mock<Resettable>();

    const proxy = mock<RemoteProxy>();
    
    proxy.isA.calledWith(Resettable).mockReturnValue(true);
    proxy.as.calledWith(Resettable).mockReturnValue(resettable);

    const actionContext: ActionContext = {
        parent: null,
        proxy: proxy,
        clipboard: mock<Clipboard>()
    };

    const actionFactory = new SoftResetActionFactory();

    const action = await actionFactory.createAction(actionContext);

    expect(action).not.toBeNull();

    (action as Action).perform();

    expect(resettable.softReset).toBeCalled();
});

test("Hard Reset Resets", async () => {

    const resettable = mock<Resettable>();

    const proxy = mock<RemoteProxy>();
    
    proxy.isA.calledWith(Resettable).mockReturnValue(true);
    proxy.as.calledWith(Resettable).mockReturnValue(resettable);

    const actionContext: ActionContext = {
        parent: null,
        proxy: proxy,
        clipboard: mock<Clipboard>()
    };

    const actionFactory = new HardResetActionFactory();

    const action = await actionFactory.createAction(actionContext);

    expect(action).not.toBeNull();

    (action as Action).perform();

    expect(resettable.hardReset).toBeCalled();
});

test("Stoppable stops", async () => {

    const stoppable = mock<Stoppable>();

    const proxy = mock<RemoteProxy>();
    
    proxy.isA.calledWith(Stoppable).mockReturnValue(true);
    proxy.as.calledWith(Stoppable).mockReturnValue(stoppable);

    const actionContext: ActionContext = {
        parent: null,
        proxy: proxy,
        clipboard: mock<Clipboard>()
    };

    const actionFactory = new StopActionFactory();

    const action = await actionFactory.createAction(actionContext);

    expect(action).not.toBeNull();

    (action as Action).perform();

    expect(stoppable.stop).toBeCalled();
});

test("Stoppable stops", async () => {

    const stoppable = mock<Stoppable>();

    const proxy = mock<RemoteProxy>();
    
    proxy.isA.calledWith(Stoppable).mockReturnValue(true);
    proxy.as.calledWith(Stoppable).mockReturnValue(stoppable);

    const actionContext: ActionContext = {
        parent: null,
        proxy: proxy,
        clipboard: mock<Clipboard>()
    };

    const actionFactory = new StopActionFactory();

    const action = await actionFactory.createAction(actionContext);

    expect(action).not.toBeNull();

    (action as Action).perform();

    expect(stoppable.stop).toBeCalled();
});

test("Cut cuts", async () => {

    const proxy = mock<RemoteProxy>();

    const latch: Latch = new Latch();

    const dragPoint = mock<DragPoint>();
    dragPoint.isCutSupported = true;
    dragPoint.cut.calledWith()
    .mockImplementation(() => {
        latch.countDown();
        return Promise.resolve("SOME CONFIG")
    });

    const configOwner = mock<ConfigurationOwner>();

    configOwner.dragPointFor.calledWith(proxy)
    .mockImplementation((p) => Promise.resolve(dragPoint));

    const proxyOwner = mock<RemoteProxy>();
    
    proxyOwner.isA.calledWith(ConfigurationOwner).mockReturnValue(true);
    proxyOwner.as.calledWith(ConfigurationOwner).mockReturnValue(configOwner);

    const ownerContext: ActionContext = {
        parent: null,
        proxy: proxyOwner,
        clipboard: mock<Clipboard>()
    };

    const clipboard = mock<Clipboard>();

    const childContext: ActionContext = {
        parent: ownerContext,
        proxy: proxy,
        clipboard: clipboard
    };

    const actionFactory = new CutActionFactory();

    const action = await actionFactory.createAction(childContext);

    expect(action).not.toBeNull();
    expect((action as Action).isEnabled).toBe(true);

    (action as Action).perform();

    expect(dragPoint.cut).toBeCalled();

    await latch.promise;

    expect(clipboard.copy).toBeCalledWith("SOME CONFIG");
});

test("Cut disabled", async () => {

    const proxy = mock<RemoteProxy>();

    const latch: Latch = new Latch();

    const configOwner = mock<ConfigurationOwner>();

    const dragPoint = mock<DragPoint>();
    dragPoint.isCutSupported = false;

    configOwner.dragPointFor.calledWith(proxy)
    .mockImplementation((p) => {
        latch.countDown();
        return Promise.resolve(dragPoint);
    });

    const proxyOwner = mock<RemoteProxy>();
    
    proxyOwner.isA.calledWith(ConfigurationOwner).mockReturnValue(true);
    proxyOwner.as.calledWith(ConfigurationOwner).mockReturnValue(configOwner);

    const ownerContext: ActionContext = {
        parent: null,
        proxy: proxyOwner,
        clipboard: mock<Clipboard>()
    };

    const childContext: ActionContext = {
        parent: ownerContext,
        proxy: proxy,
        clipboard:  mock<Clipboard>()
    };

    const actionFactory = new CutActionFactory();

    const action = await actionFactory.createAction(childContext);

    expect(action).not.toBeNull();
    expect((action as Action).isEnabled).toBe(false);

});

test("Copy copies", async () => {

    const proxy = mock<RemoteProxy>();

    const latch: Latch = new Latch();

    const dragPoint = mock<DragPoint>();
    dragPoint.copy.calledWith()
    .mockImplementation( () => {
        latch.countDown();
        return Promise.resolve("SOME CONFIG");
    })

    const configOwner = mock<ConfigurationOwner>();

    configOwner.dragPointFor.calledWith(proxy)
    .mockImplementation((p) => Promise.resolve(dragPoint));

    const proxyOwner = mock<RemoteProxy>();
    
    proxyOwner.isA.calledWith(ConfigurationOwner).mockReturnValue(true);
    proxyOwner.as.calledWith(ConfigurationOwner).mockReturnValue(configOwner);

    const ownerContext: ActionContext = {
        parent: null,
        proxy: proxyOwner,
        clipboard: mock<Clipboard>()
    };

    const clipboard = mock<Clipboard>();

    const childContext: ActionContext = {
        parent: ownerContext,
        proxy: proxy,
        clipboard: clipboard
    };

    const actionFactory = new CopyActionFactory();

    const action = await actionFactory.createAction(childContext);

    expect(action).not.toBeNull();
    expect((action as Action).isEnabled).toBe(true);

    (action as Action).perform();

    expect(dragPoint.copy).toBeCalled();

    await latch.promise;

    expect(clipboard.copy).toBeCalledWith("SOME CONFIG");
});

test("Paste pastes", async () => {

    const proxy = mock<RemoteProxy>();

    const latch: Latch = new Latch();

    const dragPoint = mock<DragPoint>();
    dragPoint.isPasteSupported = true;
    dragPoint.paste.mockImplementation((i, c) => {
        latch.countDown();
        return Promise.resolve();
    });

    const configOwner = mock<ConfigurationOwner>();
    configOwner.dragPointFor.calledWith(proxy)
    .mockImplementation((p) => Promise.resolve(dragPoint));

    const proxyOwner = mock<RemoteProxy>();
    
    proxyOwner.isA.calledWith(ConfigurationOwner).mockReturnValue(true);
    proxyOwner.as.calledWith(ConfigurationOwner).mockReturnValue(configOwner);

    const ownerContext: ActionContext = {
        parent: null,
        proxy: proxyOwner,
        clipboard: mock<Clipboard>()
    };

    const clipboard = mock<Clipboard>();
    clipboard.paste.mockReturnValue(Promise.resolve("SOME CONFIG"));

    const childContext: ActionContext = {
        parent: ownerContext,
        proxy: proxy,
        clipboard: clipboard
    };

    const actionFactory = new PasteActionFactory();

    const action = await actionFactory.createAction(childContext);

    expect(action).not.toBeNull();
    expect((action as Action).isEnabled).toBe(true);

    (action as Action).perform();

    await latch.promise;

    expect(dragPoint.paste).toBeCalledWith(-1, "SOME CONFIG");
});

test("Delete deletes", async () => {

    const proxy = mock<RemoteProxy>();

    const dragPoint = mock<DragPoint>();
    dragPoint.isCutSupported = true;

    const configOwner = mock<ConfigurationOwner>();
    configOwner.dragPointFor.calledWith(proxy)
    .mockImplementation((p) => Promise.resolve(dragPoint));

    const proxyOwner = mock<RemoteProxy>();
    
    proxyOwner.isA.calledWith(ConfigurationOwner).mockReturnValue(true);
    proxyOwner.as.calledWith(ConfigurationOwner).mockReturnValue(configOwner);

    const ownerContext: ActionContext = {
        parent: null,
        proxy: proxyOwner,
        clipboard: mock<Clipboard>()
    };

    const childContext: ActionContext = {
        parent: ownerContext,
        proxy: proxy,
        clipboard: mock<Clipboard>()
    };

    const actionFactory = new DeleteActionFactory();

    const action = await actionFactory.createAction(childContext);

    expect(action).not.toBeNull();
    expect((action as Action).isEnabled).toBe(true);

    (action as Action).perform();

    expect(dragPoint.delete).toBeCalled();
});
