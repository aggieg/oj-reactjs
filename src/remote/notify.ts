
import { JavaClass, javaClasses, JavaObject } from './java';

export class NotificationType<T> {

    readonly type: string;

    constructor(readonly name: string,
        javaClass: JavaClass<T>) {

        this.type = javaClass.name;
    }

    static ofName<T>(name : string) {
        return { andDataType: (type: JavaClass<T>) => new NotificationType(name, type) }
    }
}

export class Notification<T> implements JavaObject<Notification<T>> {

    static readonly javaClass = javaClasses.register(
        Notification, "org.oddjob.Iconic");

    getJavaClass(): JavaClass<Notification<T>> {
        return Notification.javaClass;
    }

    constructor(readonly remoteId: number,
        readonly type: NotificationType<T>,
        readonly sequence: number,
        readonly data?: T) {
    }

}


export interface NotificationListener<T> {

    handleNotification(notification: Notification<T>): void;
}

export interface Notifier {

    addNotificationListener<T>(remoteId: number,
        notificationType: NotificationType<T>,
        listener: NotificationListener<T>): void;

    removeNotificationListener<T>(remoteId: number,
        notificationType: NotificationType<T>,
        listener: NotificationListener<T>): void;
}

class SubscriptionRequest<T> {

    constructor(readonly action: string,
        readonly remoteId: number,
        readonly type: NotificationType<T>) {
    }
}


export class RemoteNotifier implements Notifier {

    private readonly ws: WebSocket;

    private listener?: NotificationListener<any>;

    constructor(url: string) {
        this.ws = new WebSocket(url);
        this.ws.onmessage = this.callback;
    }

    callback = (event: any) => {

        const notification = JSON.parse(event.data) as Notification<any>;

        this.listener?.handleNotification(notification);
    }


    addNotificationListener<T>(remoteId: number,
        notificationType: NotificationType<T>,
        listener: NotificationListener<T>): void {

        this.listener = listener;

        const request = new SubscriptionRequest<T>("ADD", remoteId, notificationType);

        this.ws.send(JSON.stringify(request));
    }

    removeNotificationListener<T>(remoteId: number,
        notificationType: NotificationType<T>,
        listener: NotificationListener<T>): void {



    }
}