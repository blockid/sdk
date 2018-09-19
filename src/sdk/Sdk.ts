// import { IBN } from "bn.js";
// import { randomBytes } from "crypto";
// import { concat, from, Observable, of } from "rxjs";
// import { delay, filter, map, switchMap, take, tap } from "rxjs/operators";
// import { Api, ApiStates, IApi } from "../api";
// import { Device, IDevice, IDeviceAttributes } from "../device";
// import { Ens, IEns } from "../ens";
// import { Identity, IdentityStates, IIdentity, IIdentityAttributes } from "../identity";
// import {
//   ILinker,
//   ILinkerApp,
//   ILinkerTarget,
//   Linker,
//   LinkerActionPayloads,
//   LinkerActionsTypes,
//   LinkerTargetTypes,
// } from "../linker";
// import { INetwork, Network, NetworkVersions } from "../network";
// import { IRegistry, Registry } from "../registry";
// import {
//   ErrorSubject,
//   generateRandomPrivateKey,
//   recoverAddressFromPersonalMessage,
//   TUniqueBehaviorSubject,
//   UniqueBehaviorSubject,
// } from "../shared";
// import { IStorage, Storage } from "../storage";
// import { WsMessagePayloads, WsMessageTypes } from "../ws";
// import { SdkStorageKeys } from "./constants";
// import { ISdk, ISdkAuthAction, ISdkOptions } from "./interfaces";
// import { TSdkSettings } from "./types";
//
// /**
//  * Sdk
//  */
// export class Sdk implements ISdk {
//
//   private static prepareSettings(value: TSdkSettings, oldValue: TSdkSettings): TSdkSettings {
//     return value
//       ? {
//         ...(oldValue || {}),
//         ...value,
//       } : null;
//   }
//
//   /**
//    * settings subject
//    */
//   public settings$: TUniqueBehaviorSubject<TSdkSettings>;
//
//   /**
//    * auth action subject
//    */
//   public authAction$ = new UniqueBehaviorSubject<ISdkAuthAction>();
//
//   /**
//    * error subject
//    */
//   public error$ = new ErrorSubject();
//
//   /**
//    * api
//    */
//   public api: IApi;
//
//   /**
//    * device
//    */
//   public device: IDevice;
//
//   /**
//    * ens
//    */
//   public ens: IEns;
//
//   /**
//    * linker
//    */
//   public linker: ILinker;
//
//   /**
//    * identity
//    */
//   public identity: IIdentity;
//
//   /**
//    * network
//    */
//   public network: INetwork;
//
//   /**
//    * registry
//    */
//   public registry: IRegistry;
//
//   private storage: IStorage = null;
//
//   private sessionHash: Buffer = null;
//
//   private readonly options: ISdkOptions;
//
//   /**
//    * constructor
//    * @param options
//    */
//   constructor(options: ISdkOptions = null) {
//     this.options = options;
//     this.settings$ = new UniqueBehaviorSubject<TSdkSettings>(null, Sdk.prepareSettings);
//
//     if (this.options) {
//       try {
//         this.initialize();
//         this.setupStorage();
//         this.setupApi();
//         this.setupEns();
//         this.setupRegistry();
//         this.setupIdentity();
//         this.setupNetwork();
//         this.setupLinker();
//       } catch (err) {
//         this.error$.next(err);
//       }
//     }
//   }
//
//   /**
//    * auth action getter
//    */
//   public get authAction(): ISdkAuthAction {
//     return this.authAction$.value;
//   }
//
//   /**
//    * signs and verifies api session
//    */
//   public signAndVerifyApiSession(): void {
//     this
//       .error$
//       .wrapAsync(async () => {
//         const signature = await this.device.signPersonalMessage(this.sessionHash);
//         this.api.verifySession(signature);
//       });
//   }
//
//   /**
//    * mutes api session
//    */
//   public muteApiSession(): void {
//     this
//       .error$
//       .wrapAsync(() => this.api.muteSession());
//   }
//
//   /**
//    * un mutes api session
//    */
//   public unMuteApiSession(): void {
//     this
//       .error$
//       .wrapAsync(() => this.api.unMuteSession());
//   }
//
//   /**
//    * creates self identity
//    * @param name
//    */
//   public createSelfIdentity(name: string): Promise<boolean> {
//     return this
//       .error$
//       .wrapTAsync<boolean>(async () => {
//         let result: boolean = false;
//
//         const ensRecord = await this.ens.lookup(name);
//         if (
//           ensRecord &&
//           !ensRecord.address &&
//           ensRecord.supported
//         ) {
//           const {
//             nameHash,
//             labelHash,
//             rootNode: {
//               nameHash: rootNodeNameHash,
//             },
//           } = ensRecord;
//
//           const hash = await this.registry.createSelfIdentity(labelHash, rootNodeNameHash);
//
//           if (hash) {
//             this.identity.setStateAsCreating({
//               name,
//               nameHash,
//             });
//
//             result = true;
//           }
//         }
//
//         return result;
//       });
//   }
//
//   /**
//    * signs in to identity
//    * @param name
//    * @param fromType
//    * @param toApp
//    */
//   public signInToIdentity(name: string, fromType: LinkerTargetTypes = null, toApp: ILinkerApp = null): Promise<string> {
//     return this
//       .error$
//       .wrapTAsync<string>(async () => {
//         let result: string = null;
//
//         const ensRecord = await this.ens.lookup(name);
//         if (
//           ensRecord &&
//           ensRecord.address &&
//           ensRecord.supported
//         ) {
//
//           this.identity.setStateAsPending(ensRecord.address, {
//             name: ensRecord.name,
//             nameHash: ensRecord.nameHash,
//           });
//
//           const member = await this.api.getIdentityMember(ensRecord.address, this.device.address);
//
//           if (member) {
//             const identity = await this.api.getIdentity(ensRecord.address);
//
//             this.identity.update({
//               ...identity,
//               state: IdentityStates.Verified,
//             });
//
//           } else if (fromType) {
//             let from: ILinkerTarget = null;
//
//             switch (fromType) {
//               case LinkerTargetTypes.Device:
//                 from = {
//                   type: fromType,
//                   data: this.device.address,
//                 };
//                 break;
//             }
//
//             result = this.linker.buildActionUrl<any, LinkerActionPayloads.IAddMember>({
//               type: LinkerActionsTypes.SendAddIdentityMember,
//               from,
//               to: toApp ? {
//                 type: LinkerTargetTypes.App,
//                 data: toApp,
//               } : null,
//               payload: {
//                 identity: ensRecord.address,
//                 address: this.device.address,
//               },
//             });
//           }
//         }
//
//         return result;
//       });
//   }
//
//   /**
//    * activates auth action
//    * @param type
//    * @param payload
//    */
//   public activateAuthAction({ type, payload }: Partial<ISdkAuthAction>): string {
//     const hash = randomBytes(16);
//
//     this.unMuteApiSession();
//
//     this.authAction$.next({
//       type,
//       payload,
//       hash,
//     });
//
//     return this.linker.buildActionUrl<string, Buffer>({
//       type: LinkerActionsTypes.SignPersonalMessage,
//       from: {
//         type: LinkerTargetTypes.Device,
//         data: this.device.address,
//       },
//       to: null,
//       payload: hash,
//     });
//   }
//
//   /**
//    * deactivates auth action
//    */
//   public deactivateAuthAction(): void {
//     this.muteApiSession();
//
//     this.authAction$.next(null);
//   }
//
//   protected initialize(): void {
//     this.network = new Network();
//     this.api = new Api(this.options.api);
//     this.device = new Device(this.network);
//     this.ens = new Ens(this.network);
//     this.linker = new Linker(this.options.linker || null);
//     this.identity = new Identity(this.api, this.network, this.device);
//     this.registry = new Registry(this.network, this.device);
//     this.storage = new Storage(this.options.storage);
//
//     concat<any>(
//       this.api.state$,
//       this.device.address$,
//     )
//       .pipe(
//         filter(() => (
//           this.device.address &&
//           this.api.state === ApiStates.Connected
//         )),
//       )
//       .subscribe(() => this.signAndVerifyApiSession());
//
//     this
//       .api
//       .state$
//       .pipe(
//         filter((state) => state === ApiStates.Verified),
//         switchMap(() => from(this.error$.wrapTAsync(this.api.getSettings()))),
//         filter((settings) => !!settings),
//       )
//       .subscribe(this.settings$);
//   }
//
//   protected setupStorage(): void {
//     if (!this.storage) {
//       return;
//     }
//
//     this
//       .storage
//       .error$
//       .subscribe(this.error$);
//
//     this.error$.wrapAsync(async () => {
//
//       // device
//       {
//         let attributes = await this.storage.getDoc<IDeviceAttributes>(SdkStorageKeys.Device);
//
//         if (!attributes) {
//           attributes = {
//             privateKey: generateRandomPrivateKey(),
//           };
//
//           await this.storage.setDoc(SdkStorageKeys.Device, attributes);
//         }
//
//         this.device.attributes = attributes;
//       }
//
//       // identity
//       {
//         const attributes = await this.storage.getDoc<IIdentityAttributes>(SdkStorageKeys.Identity);
//         if (attributes) {
//
//           const { address } = attributes;
//           const member = this.api.getIdentityMember(address, this.device.address);
//
//           this.identity.attributes = member ? attributes : null;
//         }
//
//         this
//           .identity
//           .attributes$
//           .subscribe((attributes) => this.error$.wrapAsync(
//             this.storage.setDoc(
//               SdkStorageKeys.Identity,
//               attributes && attributes.state === IdentityStates.Verified
//                 ? attributes
//                 : null,
//             ),
//           ));
//       }
//
//       // settings
//       {
//         this
//           .settings$
//           .next(await this.storage.getDoc<TSdkSettings>(SdkStorageKeys.Settings));
//
//         this
//           .settings$
//           .pipe(
//             filter((settings) => !!settings),
//           )
//           .subscribe((settings) => this.error$.wrapAsync(
//             this.storage.setDoc(SdkStorageKeys.Settings, settings),
//           ));
//       }
//
//     });
//   }
//
//   protected setupApi(): void {
//     this
//       .api
//       .wsMessage$
//       .pipe(
//         filter((value) => !!value),
//         tap(({ type, payload }) => this.error$.wrapAsync(async () => {
//           switch (type) {
//             case WsMessageTypes.SessionCreated: {
//               const { hash } = payload as WsMessagePayloads.ISession;
//               this.sessionHash = hash;
//               this.api.state = ApiStates.Connected;
//               break;
//             }
//
//             case WsMessageTypes.SessionVerified: {
//               this.api.state = ApiStates.Verified;
//               break;
//             }
//
//             case WsMessageTypes.SignedPersonalMessage: {
//               const { signer, signature } = payload as WsMessagePayloads.ISignedPersonalMessage;
//               if (
//                 this.authAction &&
//                 signer &&
//                 signer === recoverAddressFromPersonalMessage(this.authAction.hash, signature)
//               ) {
//                 const { type, payload } = this.authAction;
//
//                 this.linker.incomingAction$.next({
//                   type,
//                   from: {
//                     type: LinkerTargetTypes.Device,
//                     data: signer,
//                   },
//                   payload,
//                 });
//
//                 this.deactivateAuthAction();
//               }
//               break;
//             }
//
//             case WsMessageTypes.IdentityCreated: {
//               const { address, ensNameHash } = payload as WsMessagePayloads.IIdentity;
//
//               this.identity.update({
//                 address,
//                 ensNode: {
//                   name: null,
//                   nameHash: ensNameHash,
//                 },
//                 state: IdentityStates.Verified,
//               });
//               break;
//             }
//
//             case WsMessageTypes.IdentityBalanceUpdated: {
//               const balance = await this.identity.balance;
//               this.identity.balance$.next(balance);
//               break;
//             }
//
//             case WsMessageTypes.IdentityMemberAdded: {
//               const { identity, ...member } = payload as WsMessagePayloads.IIdentityMember;
//
//               if (identity === this.identity.address) {
//
//                 if (
//                   this.identity.state === IdentityStates.Pending &&
//                   this.device.address === member.address
//                 ) {
//                   this.identity.update({
//                     address: identity,
//                     state: IdentityStates.Verified,
//                   });
//                 }
//
//                 this.identity.addMember(member as any);
//               }
//
//               break;
//             }
//
//             case WsMessageTypes.IdentityMemberLimitUpdated: {
//               const { identity, ...member } = payload as WsMessagePayloads.IIdentityMember;
//
//               if (identity === this.identity.address) {
//                 this.identity.updateMember(member);
//               }
//
//               break;
//             }
//
//             case WsMessageTypes.IdentityMemberRemoved: {
//               const { identity, ...member } = payload as WsMessagePayloads.IIdentityMember;
//
//               if (identity === this.identity.address) {
//                 if (member.address === this.device.address) {
//                   this.identity.attributes = null;
//                 } else {
//                   this.identity.removeMember(member);
//                 }
//               }
//
//               break;
//             }
//           }
//         })),
//       )
//       .subscribe();
//
//     this
//       .api
//       .state$
//       .pipe(
//         filter((state) => (
//           state !== ApiStates.Connected &&
//           state !== ApiStates.Verified
//         )),
//         tap(() => {
//           this.sessionHash = null;
//         }),
//       )
//       .subscribe();
//   }
//
//   protected setupEns(): void {
//     this
//       .settings$
//       .pipe(
//         map((settings) => settings ? settings.ens : null),
//       )
//       .subscribe(this.ens.attributes$);
//   }
//
//   protected setupNetwork(): void {
//     this
//       .settings$
//       .pipe(
//         map((settings) => settings ? settings.network : null),
//       )
//       .subscribe(this.network.attributes$);
//   }
//
//   protected setupRegistry(): void {
//     this
//       .settings$
//       .pipe(
//         map((settings) => settings ? settings.registry : null),
//       )
//       .subscribe(this.registry.attributes$);
//   }
//
//   protected setupIdentity(): void {
//     this
//       .network
//       .version$
//       .pipe(
//         filter((version) => version && version !== NetworkVersions.Unknown),
//         take(1),
//         delay(100),
//         switchMap(() => {
//           return this
//             .identity
//             .state$
//             .pipe(
//               switchMap((state) => {
//                 let result: Observable<IBN> = of(null);
//                 switch (state) {
//                   case IdentityStates.Verified:
//                     result = from(this.error$.wrapTAsync(this.identity.balance));
//                     break;
//                 }
//
//                 return result;
//               }),
//             );
//
//         }),
//       )
//       .subscribe(this.identity.balance$);
//
//     this
//       .identity
//       .state$
//       .pipe(
//         filter((state) => state !== IdentityStates.Verified),
//         map(() => null),
//       )
//       .subscribe(this.identity.members$);
//   }
//
//   protected setupLinker(): void {
//     this
//       .linker
//       .acceptedAction$
//       .pipe(
//         filter((value) => !!value),
//         tap(({ type, from, payload }) => {
//           this.error$.wrapAsync(async () => {
//             switch (type) {
//               case LinkerActionsTypes.SignPersonalMessage: {
//                 const hash = await this.device.signPersonalMessage(payload);
//                 switch (from.type) {
//                   case LinkerTargetTypes.Device:
//                     this.api.verifyPersonalMessage(from.data, hash);
//                     break;
//                 }
//                 break;
//               }
//
//               case LinkerActionsTypes.SendAddIdentityMember: {
//                 let { purpose } = payload as LinkerActionPayloads.IAddMember;
//                 const { identity, limit } = payload as LinkerActionPayloads.IAddMember;
//
//                 if (
//                   !identity ||
//                   this.identity.address !== identity
//                 ) {
//                   return; // TODO: error handling
//                 }
//
//                 if (purpose) {
//                   const record = await this.ens.lookup(purpose);
//
//                   if (!record || !record.address) {
//                     return; // TODO: error handling
//                   }
//                   purpose = record.address;
//                 }
//
//                 await this.identity.sendAddMember({
//                   address: from.data,
//                   purpose,
//                   limit,
//                 });
//
//                 break;
//               }
//             }
//           });
//         }),
//       )
//       .subscribe();
//   }
// }
