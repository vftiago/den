import { XMarkIcon } from "@heroicons/react/24/solid";
import { ReactNode } from "react";

type ModalProps = {
	onClose: () => void;
	children: ReactNode;
};

export const Modal = ({ children, onClose }: ModalProps) => {
	return (
		<div className="modal-overlay">
			<div className="modal-content">
				<div style={{ width: " 24px" }}>
					<XMarkIcon onClick={onClose} />
				</div>
				{children}
			</div>
		</div>
	);
};
