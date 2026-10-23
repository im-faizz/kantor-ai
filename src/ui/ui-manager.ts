import { TopBar } from './top-bar';
import { Drawer } from './drawer';
import { DetailModal } from './detail-modal';
import { ActivityLogPanel } from './activity-log';
import { CameraControls } from './camera-controls';
import { CameraHint } from './hint';
import { AgentManager, AgentRuntimeState, TaskResultItem } from '../agents/agent-manager';
import { CameraController } from '../world/camera';

export class UIManager {
  private overlayContainer: HTMLElement;
  public topBar: TopBar;
  public drawer: Drawer;
  public detailModal: DetailModal;
  public activityLog: ActivityLogPanel;
  public cameraControls: CameraControls;
  public cameraHint: CameraHint;

  private agentManager: AgentManager;
  private camera: CameraController;

  private isDrawerOpen: boolean = false;
  private isDetailOpen: boolean = false;

  constructor(
    overlayContainer: HTMLElement,
    agentManager: AgentManager,
    camera: CameraController
  ) {
    this.overlayContainer = overlayContainer;
    this.agentManager = agentManager;
    this.camera = camera;

    // 1. Camera Controls (Bottom Left)
    this.cameraControls = new CameraControls({
      onZoomIn: () => this.camera.zoomCenter(1.25),
      onZoomOut: () => this.camera.zoomCenter(0.8),
      onReset: () => this.camera.resetCamera()
    });
    this.overlayContainer.appendChild(this.cameraControls.container);

    // 2. Camera Hint (Bottom Center)
    this.cameraHint = new CameraHint();
    this.overlayContainer.appendChild(this.cameraHint.element);

    // 3. Activity Log (Bottom Right)
    this.activityLog = new ActivityLogPanel();
    this.overlayContainer.appendChild(this.activityLog.container);

    // 4. Drawer (Right)
    this.drawer = new Drawer({
      onClose: () => this.closeDrawer(),
      onSelectAgent: (agentId) => {
        this.openChatWithAgent(agentId);
      },
      onSendMessage: (agentId, text) => {
        this.agentManager.sendUserMessage(agentId, text);
      }
    });
    this.overlayContainer.appendChild(this.drawer.container);

    // 5. Detail Modal (Full screen)
    this.detailModal = new DetailModal({
      onClose: () => this.closeDetail(),
      onOpenChat: (agentId) => {
        this.closeDetail();
        this.openChatWithAgent(agentId);
      }
    });
    this.overlayContainer.appendChild(this.detailModal.overlay);

    // 6. Top Bar (Top Left & Top Right)
    this.topBar = new TopBar({
      onOpenDetail: () => this.openDetail(),
      onToggleDrawer: () => this.toggleDrawer()
    });
    this.overlayContainer.appendChild(this.topBar.container);

    // Listen for agent manager updates
    this.agentManager.onStateChanged = () => {
      this.updateState();
    };

    this.agentManager.onAgentClicked = (agentId) => {
      if (!this.camera.hasDragged) {
        this.openChatWithAgent(agentId);
      }
    };

    this.updateState();
  }

  public openDetail(agentId?: string) {
    this.isDetailOpen = true;
    if (this.isDrawerOpen) {
      this.closeDrawer();
    }
    if (agentId) {
      this.detailModal.setSelectedAgent(agentId);
    }
    this.detailModal.setVisible(true);
    this.syncVisibility();
  }

  public closeDetail() {
    this.isDetailOpen = false;
    this.detailModal.setVisible(false);
    this.syncVisibility();
  }

  public toggleDrawer() {
    if (this.isDrawerOpen) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  public openDrawer() {
    this.isDrawerOpen = true;
    if (this.isDetailOpen) {
      this.closeDetail();
    }
    this.drawer.setVisible(true);
    this.topBar.setDrawerOpen(true);
    this.syncVisibility();
  }

  public closeDrawer() {
    this.isDrawerOpen = false;
    this.drawer.setVisible(false);
    this.topBar.setDrawerOpen(false);
    this.agentManager.selectAgent(null);
    this.syncVisibility();
  }

  public openChatWithAgent(agentId: string) {
    this.openDrawer();
    this.drawer.showChat(agentId);
    this.agentManager.selectAgent(agentId);

    const st = this.agentManager.getAgentState(agentId);
    if (st) {
      this.camera.focusOn(st.x, st.y, true);
    }
    this.updateState();
  }

  private syncVisibility() {
    // Hide ActivityLogPanel if drawer or detail modal is open
    const shouldHideLog = this.isDrawerOpen || this.isDetailOpen;
    this.activityLog.setVisible(!shouldHideLog);
  }

  public updateState() {
    this.drawer.updateAgents(this.agentManager.agents);

    const activeChatId = this.drawer.getSelectedAgentId();
    if (activeChatId && this.agentManager.chats[activeChatId]) {
      this.drawer.updateMessages(this.agentManager.chats[activeChatId]);
    }

    this.detailModal.updateData(this.agentManager.agents, this.agentManager.results);
    this.activityLog.updateResults(this.agentManager.results);
  }
}
