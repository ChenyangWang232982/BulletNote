import os
import sys

# 根目录：脚本所在的目录（D:\work\project2），无需修改
ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
# 要汇总的文件后缀（仅py和js，如需新增可直接添加，如".html"）
TARGET_SUFFIXES = (".js")

def main():
    # 终端欢迎信息，明确功能
    print(f"===== Python & JS File Summary Tool =====")
    print(f"Root Directory: {ROOT_DIR}")
    print(f"Target File Types: .py, .js")
    print(f"Please enter the FOLDER NAME (in root directory) to summarize:")
    # 获取用户输入，自动去除首尾空格（避免输入误判）
    target_folder_name = input("> ").strip()
    # 拼接目标文件夹的完整路径
    target_folder = os.path.join(ROOT_DIR, target_folder_name)

    # 第一步：校验目标文件夹是否有效
    if not os.path.exists(target_folder):
        print(f"\nError: Folder '{target_folder_name}' does NOT exist in root directory!")
        return
    if not os.path.isdir(target_folder):
        print(f"\nError: '{target_folder_name}' is NOT a folder!")
        return

    # 第二步：定义根目录的汇总TXT路径和名称
    summary_txt_name = f"{target_folder_name}_py_js_summary.txt"
    summary_txt_path = os.path.join(ROOT_DIR, summary_txt_name)
    # 统计有效汇总的文件数
    summarized_count = 0

    # 打印开始信息
    print(f"\n===== Start Summarizing =====")
    print(f"Target Folder: {target_folder_name}")
    print(f"Summary File: {summary_txt_name} (saved in root directory)")
    print(f"Traversal Order: Directory Tree (Parent → Child, sorted by filename)\n")

    # 第三步：按目录树顺序遍历，汇总py/js文件到TXT
    with open(summary_txt_path, "w", encoding="utf-8") as summary_f:
        # 写入汇总头部信息（方便后续查看）
        summary_f.write(f"===== Python & JS Files Summary - {target_folder_name} =====")
        summary_f.write(f"\nRoot Directory: {ROOT_DIR}")
        summary_f.write(f"\nTarget Folder: {target_folder}")
        summary_f.write(f"\nTarget File Types: {', '.join(TARGET_SUFFIXES)}")
        summary_f.write(f"\nTraversal Order: Directory Tree (Parent → Child, sorted by filename)")
        summary_f.write(f"\n" + "=" * 100 + "\n\n")

        # 递归遍历目标文件夹：os.walk天然按目录树顺序，子文件夹后遍历
        for current_dir, _, files in os.walk(target_folder):
            # 同文件夹内文件按文件名升序排序，保证遍历顺序固定
            sorted_files = sorted(files)
            for file_name in sorted_files:
                # 筛选仅py和js文件
                if file_name.lower().endswith(TARGET_SUFFIXES):
                    # 拼接文件完整路径
                    file_full_path = os.path.join(current_dir, file_name)
                    # 计算相对根目录的完整路径（核心：带路径溯源）
                    file_rel_path = os.path.relpath(file_full_path, ROOT_DIR)
                    # 终端打印实时汇总进度
                    sys.stdout.write(f"Summarizing: {file_rel_path}\n")

                    # 写入文件基础信息（路径）
                    summary_f.write(f"[FILE] {file_rel_path}\n")
                    summary_f.write("-" * 80 + "\nContent:\n")

                    # 读取并写入文件内容，处理编码异常
                    try:
                        with open(file_full_path, "r", encoding="utf-8") as f:
                            summary_f.write(f.read())
                    except UnicodeDecodeError:
                        summary_f.write(f"[Read Error] File is not UTF-8 encoded, cannot read content.\n")
                    except Exception as e:
                        summary_f.write(f"[Read Error] Failed to read file: {str(e)}\n")

                    # 不同文件之间加分隔线，避免内容粘连
                    summary_f.write(f"\n" + "=" * 100 + "\n\n")
                    summarized_count += 1

    # 第四步：打印汇总完成信息
    print(f"\n===== Summary Completed! =====")
    print(f"Total .py & .js files summarized: {summarized_count}")
    print(f"Summary file saved to: {summary_txt_path}")
    if summarized_count == 0:
        print(f"Note: No .py or .js files found in '{target_folder_name}'.")

if __name__ == "__main__":
    main()